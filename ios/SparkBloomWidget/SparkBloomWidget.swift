import SwiftUI
import WidgetKit

// MARK: - Логика (⚠ копия src/lib/sparkLogic.ts и SparkLogic.kt)

enum Stage: Int, CaseIterable {
  case ember, spark, glow, blaze, nova
  var key: String { ["ember", "spark", "glow", "blaze", "nova"][rawValue] }
  var title: String { ["Ember", "Spark", "Glow", "Blaze", "Nova"][rawValue] }
  var threshold: Int { [0, 3, 7, 14, 21][rawValue] }
}

enum Emotion: String, CaseIterable {
  case sad, sleepy, happy, energetic
}

enum SparkLogic {
  static func emotion(_ steps: Int) -> Emotion {
    if steps < 3000 { return .sad }
    if steps < 6500 { return .sleepy }
    if steps < 10500 { return .happy }
    return .energetic
  }

  static func stage(_ streak: Int) -> Stage {
    if streak >= 21 { return .nova }
    if streak >= 14 { return .blaze }
    if streak >= 7 { return .glow }
    if streak >= 3 { return .spark }
    return .ember
  }

  /// Прогресс внутри текущей стадии 0…1; на Nova = 1.
  static func stageProgress(_ streak: Int) -> Double {
    let s = stage(streak)
    guard let next = Stage(rawValue: s.rawValue + 1) else { return 1 }
    let p = Double(streak - s.threshold) / Double(next.threshold - s.threshold)
    return min(max(p, 0), 1)
  }

  static func progressPct(_ streak: Int) -> Int { Int((stageProgress(streak) * 100).rounded()) }

  /// Картинка с тем же fallback, что и в приложении.
  static func characterAsset(_ stage: Stage, _ emotion: Emotion) -> String {
    let lower = Stage.allCases.filter { $0.rawValue < stage.rawValue }.reversed()
    let higher = Stage.allCases.filter { $0.rawValue > stage.rawValue }
    let order = [stage] + lower + higher
    for e in [emotion, .happy] {
      for s in order where WidgetAssets.character.contains("\(s.key)_\(e.rawValue)") {
        return "char_\(s.key)_\(e.rawValue)"
      }
    }
    for s in order {
      for e in Emotion.allCases where WidgetAssets.character.contains("\(s.key)_\(e.rawValue)") {
        return "char_\(s.key)_\(e.rawValue)"
      }
    }
    return "char_" + (WidgetAssets.character.sorted().first ?? "spark_happy")
  }
}

// MARK: - Данные из App Group

/// AltStore/SideStore при установке переименовывают App Group и записывают
/// настоящий ID в Info.plist (ALTAppGroups). Без них — обычный ID.
func resolvedAppGroup() -> String {
  if let groups = Bundle.main.object(forInfoDictionaryKey: "ALTAppGroups") as? [String],
     let g = groups.first(where: { $0.hasPrefix("group.com.sparkbloom.app") }) ?? groups.first {
    return g
  }
  return "group.com.sparkbloom.app"
}

let appGroup = resolvedAppGroup()

struct SparkEntry: TimelineEntry {
  let date: Date
  let steps: Int
  let goal: Int
  let streak: Int
  let theme: String

  var stage: Stage { SparkLogic.stage(streak) }
  var emotion: Emotion { SparkLogic.emotion(steps) }
  var pct: Int { SparkLogic.progressPct(streak) }
  var isLight: Bool { theme == "light" }

  static func load() -> SparkEntry {
    let d = UserDefaults(suiteName: appGroup)
    func int(_ k: String, _ def: Int) -> Int { d?.object(forKey: k) as? Int ?? def }
    return SparkEntry(
      date: Date(),
      steps: int("steps", 6000),
      goal: int("goalSteps", 8000),
      streak: int("streakDays", 1),
      theme: d?.string(forKey: "theme") ?? "dark"
    )
  }
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> SparkEntry { .load() }
  func getSnapshot(in context: Context, completion: @escaping (SparkEntry) -> Void) {
    completion(.load())
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<SparkEntry>) -> Void) {
    // Приложение само дёргает reloadAllTimelines при изменениях; это — страховка.
    let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
    completion(Timeline(entries: [.load()], policy: .after(next)))
  }
}

// MARK: - Цвета (явно от темы приложения, не от системной)

struct Palette {
  let bgTop, bgBottom, text, dim, accent, track, flame: Color

  static func of(_ e: SparkEntry) -> Palette {
    e.isLight
      ? Palette(bgTop: Color(hex: 0xFFFFFF), bgBottom: Color(hex: 0xF3F6EE), text: Color(hex: 0x1C2016),
                dim: Color(hex: 0x77816E), accent: Color(hex: 0x5F9C2C), track: Color(hex: 0xEDF0E6),
                flame: Color(hex: 0xE8832C))
      : Palette(bgTop: Color(hex: 0x141A10), bgBottom: Color(hex: 0x0B0D09), text: Color(hex: 0xEEF1EA),
                dim: Color(hex: 0x93A08D), accent: Color(hex: 0x8BC543), track: Color(hex: 0x2A3124),
                flame: Color(hex: 0xFF9D4D))
  }
}

extension Color {
  init(hex: UInt32) {
    self.init(red: Double((hex >> 16) & 0xFF) / 255,
              green: Double((hex >> 8) & 0xFF) / 255,
              blue: Double(hex & 0xFF) / 255)
  }
}

// MARK: - Вид

struct SparkBloomWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: SparkEntry

  var body: some View {
    let c = Palette.of(entry)
    Group {
      switch family {
      case .systemSmall: small(c)
      case .systemLarge: large(c)
      default: medium(c)
      }
    }
    .widgetURL(URL(string: "sparkbloom://open"))
    .modifier(WidgetBackground(c: c))
  }

  func character(_ h: CGFloat) -> some View {
    Image(SparkLogic.characterAsset(entry.stage, entry.emotion))
      .resizable()
      .scaledToFit()
      .frame(width: h * 2 / 3, height: h)
  }

  func bar(_ c: Palette) -> some View {
    GeometryReader { g in
      ZStack(alignment: .leading) {
        Capsule().fill(c.track)
        Capsule().fill(c.accent).frame(width: g.size.width * CGFloat(entry.pct) / 100)
      }
    }
    .frame(height: 6)
  }

  func small(_ c: Palette) -> some View {
    VStack(spacing: 8) {
      character(96)
      bar(c)
    }
  }

  func medium(_ c: Palette) -> some View {
    HStack(spacing: 14) {
      character(110)
      VStack(alignment: .leading, spacing: 6) {
        Text(entry.stage.title).font(.system(size: 20, weight: .bold, design: .rounded)).foregroundColor(c.text)
        Text("\(entry.pct)%").font(.system(size: 16, weight: .bold)).foregroundColor(c.accent)
        bar(c).padding(.top, 4)
      }
    }
  }

  func large(_ c: Palette) -> some View {
    VStack(spacing: 10) {
      character(170)
      VStack(alignment: .leading, spacing: 8) {
        line("diamond.fill", c.accent, "\(entry.steps.formatted(.number.locale(Locale(identifier: "ru_RU")))) шагов сегодня", c)
        line("flame.fill", c.flame, "\(entry.streak) дней подряд", c)
        line("sparkle", c.accent, "\(entry.pct)% до след. стадии", c)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    }
  }

  func line(_ symbol: String, _ tint: Color, _ text: String, _ c: Palette) -> some View {
    HStack(spacing: 8) {
      Image(systemName: symbol).foregroundColor(tint).font(.system(size: 14, weight: .semibold))
      Text(text).font(.system(size: 15, weight: .semibold)).foregroundColor(c.text)
    }
  }
}

/// iOS 17+: фон через containerBackground (иначе белые поля); iOS 16: обычный фон.
struct WidgetBackground: ViewModifier {
  let c: Palette
  func body(content: Content) -> some View {
    let g = LinearGradient(colors: [c.bgTop, c.bgBottom], startPoint: .top, endPoint: .bottom)
    if #available(iOS 17.0, *) {
      content.containerBackground(for: .widget) { g }
    } else {
      content.padding().background(g)
    }
  }
}

@main
struct SparkBloomWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "SparkBloomWidget", provider: Provider()) { entry in
      SparkBloomWidgetView(entry: entry)
    }
    .configurationDisplayName("Spark Bloom")
    .description("Твой компаньон на главном экране.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

import Foundation
import WidgetKit

/// JS: NativeModules.SparkBloomWidgetBridge.updateState(steps, goalSteps, streakDays, theme)
/// Пишет в UserDefaults общей App Group и просит WidgetKit перерисовать виджеты.
@objc(SparkBloomWidgetBridge)
class SparkBloomWidgetBridge: NSObject {
  /// См. resolvedAppGroup в виджете: AltStore/SideStore переименовывают группу.
  static let appGroup: String = {
    if let groups = Bundle.main.object(forInfoDictionaryKey: "ALTAppGroups") as? [String],
       let g = groups.first(where: { $0.hasPrefix("group.com.sparkbloom.app") }) ?? groups.first {
      return g
    }
    return "group.com.sparkbloom.app"
  }()

  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func updateState(_ steps: NSNumber,
                         goalSteps: NSNumber,
                         streakDays: NSNumber,
                         theme: NSString) {
    guard let d = UserDefaults(suiteName: Self.appGroup) else { return }
    d.set(steps.intValue, forKey: "steps")
    d.set(goalSteps.intValue, forKey: "goalSteps")
    d.set(streakDays.intValue, forKey: "streakDays")
    d.set(theme as String, forKey: "theme")
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}

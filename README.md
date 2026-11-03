# Spark Bloom

Компаньон для шагов: настроение персонажа зависит от шагов за сегодня, стадия — от серии дней с выполненной целью. React Native (iOS + Android) + нативные виджеты (WidgetKit / Jetpack Glance).

## Сборка

Каждый пуш в `main` запускает **Actions → Build**:

- `SparkBloom.apk` — Android, ставится напрямую;
- `SparkBloom.ipa` — iPhone, ставится через AltStore / SideStore.

Готовые файлы — в релизе **latest** (Releases), их удобно скачать прямо с телефона.

## Картинки персонажа

1. Положить PNG в `assets/characters/` с именами `{stage}_{emotion}.png`
   (stage: ember, spark, glow, blaze, nova; emotion: sad, sleepy, happy, energetic), фон прозрачный, 2:3.
   Утка — `assets/duck/duck_ember.png`, `duck_{stage}_{emotion}.png`, 1:1.
2. `node scripts/gen-assets.js` — таблица картинок для приложения.
3. `python3 scripts/gen-widget-assets.py` — картинки и таблицы для виджетов.

Пока каких-то картинок нет, везде показывается ближайшая существующая (в итоге — эталон `spark_happy`).

## Где что

| | |
|---|---|
| `src/lib/sparkLogic.ts` | пороги стадий/настроений, смена дня (дублируется в `SparkLogic.kt` и `SparkBloomWidget.swift`) |
| `src/store/useAppStore.ts` | состояние + сохранение + синхронизация с виджетом |
| `src/screens/` | экраны; скрытый экран разработки — 5 тапов по «Spark Bloom 1.0.0» в More |
| `android/.../widget/` | Glance-виджет, мост, DataStore |
| `ios/SparkBloomWidget/` | WidgetKit-виджет; цель в Xcode добавляет `scripts/add-ios-widget-target.rb` при сборке |

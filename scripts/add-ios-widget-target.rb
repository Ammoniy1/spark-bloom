# Добавляет в ios/SparkBloom.xcodeproj:
#  - в приложение: мост SparkBloomWidgetBridge (.swift/.m) и entitlements с App Group;
#  - отдельную цель SparkBloomWidgetExtension (WidgetKit) и встраивает её в приложение.
# Идемпотентен: повторный запуск ничего не дублирует.
# Запуск (на macOS, нужен gem xcodeproj — идёт вместе с CocoaPods):
#   ruby scripts/add-ios-widget-target.rb
require 'xcodeproj'

ROOT = File.expand_path('..', __dir__)
PROJ = File.join(ROOT, 'ios/SparkBloom.xcodeproj')
APP_ID = 'com.sparkbloom.app'
WIDGET = 'SparkBloomWidgetExtension'

project = Xcodeproj::Project.open(PROJ)
app = project.targets.find { |t| t.name == 'SparkBloom' } or abort('нет цели SparkBloom')

# --- приложение: мост + entitlements ---
app_group = project.main_group.find_subpath('SparkBloom', true)
%w[SparkBloomWidgetBridge.swift SparkBloomWidgetBridge.m].each do |f|
  next if app.source_build_phase.files_references.any? { |r| r.path&.end_with?(f) }
  # в шаблоне RN группа SparkBloom без пути, файлы указаны как SparkBloom/<имя>
  ref = app_group.files.find { |r| r.path == "SparkBloom/#{f}" } || app_group.new_reference("SparkBloom/#{f}")
  ref.name = f
  app.add_file_references([ref])
end
unless app_group.files.any? { |r| r.path == 'SparkBloom/SparkBloom.entitlements' }
  app_group.new_reference('SparkBloom/SparkBloom.entitlements').name = 'SparkBloom.entitlements'
end
app.build_configurations.each do |c|
  c.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'SparkBloom/SparkBloom.entitlements'
  c.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = APP_ID
end

# --- цель виджета ---
widget = project.targets.find { |t| t.name == WIDGET }
unless widget
  widget = project.new_target(:app_extension, WIDGET, :ios, '16.0', nil, :swift)
  group = project.main_group.find_subpath('SparkBloomWidget', true)
  group.set_source_tree('<group>')
  group.set_path('SparkBloomWidget')
  sources = %w[SparkBloomWidget.swift WidgetAssets.swift].map { |f| group.new_reference(f) }
  widget.add_file_references(sources)
  assets = group.new_reference('Assets.xcassets')
  widget.add_resources([assets])
  group.new_reference('Info.plist')
  group.new_reference('SparkBloomWidget.entitlements')
  %w[WidgetKit SwiftUI].each do |fw|
    widget.frameworks_build_phase.add_file_reference(project.frameworks_group.new_file("System/Library/Frameworks/#{fw}.framework", :sdk_root))
  end

  # встраиваем расширение в приложение
  app.add_dependency(widget)
  embed = app.copy_files_build_phases.find { |p| p.name == 'Embed Foundation Extensions' } ||
          app.new_copy_files_build_phase('Embed Foundation Extensions')
  embed.dst_subfolder_spec = '13' # PlugIns
  bf = embed.add_file_reference(widget.product_reference)
  bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
end

widget.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = "#{APP_ID}.widget"
  s['PRODUCT_NAME'] = '$(TARGET_NAME)'
  s['INFOPLIST_FILE'] = 'SparkBloomWidget/Info.plist'
  s['GENERATE_INFOPLIST_FILE'] = 'NO'
  s['CODE_SIGN_ENTITLEMENTS'] = 'SparkBloomWidget/SparkBloomWidget.entitlements'
  s['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
  s['SWIFT_VERSION'] = '5.0'
  s['TARGETED_DEVICE_FAMILY'] = '1,2'
  s['MARKETING_VERSION'] = '1.0'
  s['CURRENT_PROJECT_VERSION'] = '1'
  s['SKIP_INSTALL'] = 'YES'
  s['ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME'] = ''
  s['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
end

project.save
puts "ok: #{WIDGET} в проекте"

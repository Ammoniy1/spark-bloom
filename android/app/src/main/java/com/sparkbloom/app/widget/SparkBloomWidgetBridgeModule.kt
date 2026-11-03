package com.sparkbloom.app.widget

import androidx.datastore.preferences.core.edit
import androidx.glance.appwidget.updateAll
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/** JS: NativeModules.SparkBloomWidgetBridge.updateState(steps, goalSteps, streakDays, theme) */
class SparkBloomWidgetBridgeModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun getName() = "SparkBloomWidgetBridge"

    @ReactMethod
    fun updateState(steps: Double, goalSteps: Double, streakDays: Double, theme: String) {
        val app = ctx.applicationContext
        scope.launch {
            app.sparkBloomDataStore.edit { p ->
                p[WidgetKeys.STEPS] = steps.toInt()
                p[WidgetKeys.GOAL_STEPS] = goalSteps.toInt()
                p[WidgetKeys.STREAK_DAYS] = streakDays.toInt()
                p[WidgetKeys.THEME] = theme
            }
            SparkBloomGlanceWidget().updateAll(app)
        }
    }
}

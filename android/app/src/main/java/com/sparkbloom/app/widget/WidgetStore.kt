package com.sparkbloom.app.widget

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore

/**
 * Единственный DataStore, общий для native-модуля (пишет) и Glance-виджета (читает).
 * Объявлен один раз на верхнем уровне — второй preferencesDataStore с тем же
 * именем в процессе приводит к IllegalStateException.
 */
val Context.sparkBloomDataStore: DataStore<Preferences> by preferencesDataStore(name = "spark_bloom_widget")

object WidgetKeys {
    val STEPS = intPreferencesKey("steps")
    val GOAL_STEPS = intPreferencesKey("goalSteps")
    val STREAK_DAYS = intPreferencesKey("streakDays")
    val THEME = stringPreferencesKey("theme")
}

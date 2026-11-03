package com.sparkbloom.app.widget

// ⚠ Копия логики из src/lib/sparkLogic.ts (и ios/SparkBloomWidget/SparkLogic.swift).
// При изменении порогов — править во всех трёх местах.

enum class Stage(val title: String, val threshold: Int) {
    EMBER("Ember", 0), SPARK("Spark", 3), GLOW("Glow", 7), BLAZE("Blaze", 14), NOVA("Nova", 21);

    val key get() = name.lowercase()
}

enum class Emotion { SAD, SLEEPY, HAPPY, ENERGETIC;
    val key get() = name.lowercase()
}

object SparkLogic {
    fun emotion(steps: Int) = when {
        steps < 3000 -> Emotion.SAD
        steps < 6500 -> Emotion.SLEEPY
        steps < 10500 -> Emotion.HAPPY
        else -> Emotion.ENERGETIC
    }

    fun stage(streak: Int) = when {
        streak >= 21 -> Stage.NOVA
        streak >= 14 -> Stage.BLAZE
        streak >= 7 -> Stage.GLOW
        streak >= 3 -> Stage.SPARK
        else -> Stage.EMBER
    }

    /** Прогресс внутри текущей стадии 0..1; на Nova = 1. */
    fun stageProgress(streak: Int): Float {
        val s = stage(streak)
        val next = Stage.entries.getOrNull(s.ordinal + 1) ?: return 1f
        val p = (streak - s.threshold).toFloat() / (next.threshold - s.threshold)
        return p.coerceIn(0f, 1f)
    }

    fun progressPct(streak: Int) = Math.round(stageProgress(streak) * 100)

    /** Картинка персонажа с тем же fallback, что и в приложении. */
    fun characterRes(stage: Stage, emotion: Emotion): Int {
        val lower = Stage.entries.filter { it.ordinal < stage.ordinal }.reversed()
        val higher = Stage.entries.filter { it.ordinal > stage.ordinal }
        val order = listOf(stage) + lower + higher
        for (e in listOf(emotion, Emotion.HAPPY)) {
            for (s in order) WidgetAssets.character["${s.key}_${e.key}"]?.let { return it }
        }
        for (s in order) for (e in Emotion.entries) {
            WidgetAssets.character["${s.key}_${e.key}"]?.let { return it }
        }
        return WidgetAssets.character.values.first()
    }
}

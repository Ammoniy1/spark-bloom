package com.sparkbloom.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.Preferences
import androidx.glance.ColorFilter
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.LinearProgressIndicator
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.sparkbloom.app.MainActivity
import com.sparkbloom.app.R
import java.text.NumberFormat
import java.util.Locale

/** Состояние, которое пишет приложение через SparkBloomWidgetBridge. */
data class WidgetState(val steps: Int, val goal: Int, val streak: Int, val theme: String) {
    val stage get() = SparkLogic.stage(streak)
    val emotion get() = SparkLogic.emotion(steps)
    val pct get() = SparkLogic.progressPct(streak)

    companion object {
        // Значения по умолчанию совпадают с приложением (до первого запуска).
        fun from(p: Preferences?) = WidgetState(
            steps = p?.get(WidgetKeys.STEPS) ?: 6000,
            goal = p?.get(WidgetKeys.GOAL_STEPS) ?: 8000,
            streak = p?.get(WidgetKeys.STREAK_DAYS) ?: 1,
            theme = p?.get(WidgetKeys.THEME) ?: "dark",
        )
    }
}

private data class Palette(val bg: Color, val text: Color, val dim: Color, val accent: Color, val track: Color, val flame: Color)

private fun palette(theme: String) = if (theme == "light") {
    Palette(Color(0xFFFFFFFF), Color(0xFF1C2016), Color(0xFF77816E), Color(0xFF5F9C2C), Color(0xFFEDF0E6), Color(0xFFE8832C))
} else {
    Palette(Color(0xFF141A10), Color(0xFFEEF1EA), Color(0xFF93A08D), Color(0xFF8BC543), Color(0xFF2A3124), Color(0xFFFF9D4D))
}

class SparkBloomGlanceWidget : GlanceAppWidget() {

    companion object {
        private val SMALL = DpSize(110.dp, 110.dp)
        private val MEDIUM = DpSize(250.dp, 110.dp)
        private val LARGE = DpSize(250.dp, 250.dp)
    }

    // Responsive: Android сам выбирает один из трёх макетов под размер виджета.
    override val sizeMode = SizeMode.Responsive(setOf(SMALL, MEDIUM, LARGE))

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val prefs by context.sparkBloomDataStore.data.collectAsState(initial = null)
            Content(WidgetState.from(prefs))
        }
    }

    @Composable
    private fun Content(s: WidgetState) {
        val size = LocalSize.current
        val c = palette(s.theme)
        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(c.bg)
                .cornerRadius(22.dp)
                .padding(12.dp)
                .clickable(actionStartActivity<MainActivity>()),
            contentAlignment = Alignment.Center,
        ) {
            when {
                size.height >= LARGE.height -> Large(s, c)
                size.width >= MEDIUM.width -> Medium(s, c)
                else -> Small(s, c)
            }
        }
    }

    @Composable
    private fun Character(s: WidgetState, height: Int) {
        Image(
            provider = ImageProvider(SparkLogic.characterRes(s.stage, s.emotion)),
            contentDescription = "Spark Bloom: ${s.stage.title}",
            modifier = GlanceModifier.size((height * 2 / 3).dp, height.dp),
        )
    }

    @Composable
    private fun Bar(s: WidgetState, c: Palette) {
        LinearProgressIndicator(
            progress = s.pct / 100f,
            modifier = GlanceModifier.fillMaxWidth().height(6.dp),
            color = ColorProvider(c.accent),
            backgroundColor = ColorProvider(c.track),
        )
    }

    @Composable
    private fun Small(s: WidgetState, c: Palette) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = GlanceModifier.fillMaxSize()) {
            Box(modifier = GlanceModifier.defaultWeight(), contentAlignment = Alignment.Center) {
                Character(s, 84)
            }
            Spacer(GlanceModifier.height(6.dp))
            Bar(s, c)
        }
    }

    @Composable
    private fun Medium(s: WidgetState, c: Palette) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = GlanceModifier.fillMaxSize()) {
            Character(s, 96)
            Spacer(GlanceModifier.width(12.dp))
            Column(modifier = GlanceModifier.defaultWeight()) {
                Text(s.stage.title, style = TextStyle(color = ColorProvider(c.text), fontSize = 18.sp, fontWeight = FontWeight.Bold))
                Text("${s.pct}%", style = TextStyle(color = ColorProvider(c.accent), fontSize = 15.sp, fontWeight = FontWeight.Bold))
                Spacer(GlanceModifier.height(8.dp))
                Bar(s, c)
            }
        }
    }

    @Composable
    private fun Large(s: WidgetState, c: Palette) {
        val nf = NumberFormat.getIntegerInstance(Locale("ru", "RU"))
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = GlanceModifier.fillMaxSize()) {
            Box(modifier = GlanceModifier.defaultWeight(), contentAlignment = Alignment.Center) {
                Character(s, 140)
            }
            Spacer(GlanceModifier.height(8.dp))
            Line(R.drawable.ic_widget_diamond, c.accent, "${nf.format(s.steps)} шагов сегодня", c)
            Line(R.drawable.ic_widget_flame, c.flame, "${s.streak} дней подряд", c)
            Line(R.drawable.ic_widget_spark, c.accent, "${s.pct}% до след. стадии", c)
        }
    }

    @Composable
    private fun Line(icon: Int, tint: Color, text: String, c: Palette) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = GlanceModifier.fillMaxWidth().padding(vertical = 3.dp)) {
            Image(
                provider = ImageProvider(icon),
                contentDescription = null,
                modifier = GlanceModifier.size(16.dp),
                colorFilter = ColorFilter.tint(ColorProvider(tint)),
            )
            Spacer(GlanceModifier.width(8.dp))
            Text(text, style = TextStyle(color = ColorProvider(c.text), fontSize = 14.sp, fontWeight = FontWeight.Medium))
        }
    }
}

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Pressable, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { useLang } from '../contexts/LangContext';
import { KButton } from '../components';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    imageKey: require('../assets/images/onboarding1.png'),
    titleKey: 'onboard1Title',
    descKey: 'onboard1Desc',
  },
  {
    imageKey: require('../assets/images/onboarding2.png'),
    titleKey: 'onboard2Title',
    descKey: 'onboard2Desc',
  },
  {
    imageKey: require('../assets/images/onboarding3.png'),
    titleKey: 'onboard3Title',
    descKey: 'onboard3Desc',
  },
];

export default function OnboardingScreen() {
  const { t, lang, setLang } = useLang();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goNext = () => {
    if (active < SLIDES.length - 1) {
      const next = active + 1;
      scrollRef.current?.scrollTo({ x: width * next, animated: true });
      setActive(next);
    } else {
      router.replace('/login');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      <Pressable
        style={[styles.langSwitch, { top: insets.top + 12 }]}
        onPress={() => setLang(lang === 'en' ? 'ta' : 'en')}
      >
        <Text style={styles.langText}>{lang === 'en' ? 'தமிழ்' : 'English'}</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setActive(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {SLIDES.map((slide, idx) => (
          <View key={idx} style={[styles.slide, { width }]}>
            <Image
              source={slide.imageKey}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.overlay} />
            <View style={styles.textBox}>
              <Text style={styles.appName}>{t('appName')}</Text>
              <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
              <Text style={styles.slideDesc}>{t(slide.descKey)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
          ))}
        </View>
        <KButton
          label={active < SLIDES.length - 1 ? t('next') : t('getStarted')}
          onPress={goNext}
          fullWidth
          style={styles.btn}
        />
        <Pressable onPress={() => router.replace('/login')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark },
  langSwitch: {
    position: 'absolute', right: Spacing.md, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  langText: { color: Colors.textWhite, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm },
  slide: { height: '100%' },
  image: { width: '100%', height: '70%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,94,32,0.35)',
  },
  textBox: {
    flex: 1, padding: Spacing.xl, justifyContent: 'flex-end',
    backgroundColor: Colors.primaryDark,
  },
  appName: {
    fontSize: FontSize.sm, color: Colors.accentLight,
    fontWeight: FontWeight.semiBold, letterSpacing: 2, marginBottom: 8,
  },
  slideTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: Spacing.sm },
  slideDesc: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)', lineHeight: 24 },
  bottom: { padding: Spacing.xl, backgroundColor: Colors.primaryDark },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.accent, width: 24 },
  btn: { borderRadius: Radius.pill, backgroundColor: Colors.accent },
  skipBtn: { alignItems: 'center', marginTop: Spacing.md },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
});

import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

/**
 * Renders the main landing page for the JEE preparation app, featuring interactive sections that highlight app features, philosophy, workflow, and motivation.
 *
 * The page includes a hero section with a call-to-action, a features grid, storytelling and workflow explanations, a motivational quote, and bottom navigation. Interactive elements provide haptic feedback and navigate to the test screen.
 *
 * @returns The landing page React element for the JEE preparation app.
 */
export default function Index() {
  const router = useRouter();

  const handleGetStarted = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/test');
  };

  const handleFeaturePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/test');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f8fafc' }]}> {/* Light white background */}
      <LinearGradient
        colors={['#f8fafc', '#e0e7ff', '#f0fff0', '#fffbe6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Your JEE Success{'\n'}
                <Text style={styles.heroTitleAccent}>Starts Here</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Generate precise topics, get instant solutions, and clear every doubt. 
                <Text style={{ color: '#7f9cf5', fontWeight: '700' }}>Crack JEE with confidence and clarity.</Text>
              </Text>
              
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7f9cf5', '#43e97b', '#38f9d7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Start Your Journey</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>
              Everything a JEE Genius Needs
            </Text>
            <View style={styles.featuresGrid}>
              {/* Topic Generation Card */}
              <TouchableOpacity
                style={styles.featureCard}
                onPress={handleFeaturePress}
                activeOpacity={0.9}
              >
                <BlurView intensity={20} style={styles.glassCard}>
                  <LinearGradient
                    colors={['#f8fafc', '#e0e7ff']}
                    style={styles.cardGradient}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: '#e0e7ff' }]}> 
                      <Text style={[styles.iconText, { color: '#3b3b3b' }]}>🎯</Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: '#2d3748' }]}>Smart Topic Generator</Text>
                    <Text style={[styles.cardDescription, { color: '#4a5568' }]}>Generate any JEE topic or subtopic instantly. From basic concepts to advanced problems.</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
              {/* Precise Solutions Card */}
              <TouchableOpacity
                style={styles.featureCard}
                onPress={handleFeaturePress}
                activeOpacity={0.9}
              >
                <BlurView intensity={20} style={styles.glassCard}>
                  <LinearGradient
                    colors={['#fffbe6', '#f8fafc']}
                    style={styles.cardGradient}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: '#fffbe6' }]}> 
                      <Text style={[styles.iconText, { color: '#3b3b3b' }]}>⚡</Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: '#2d3748' }]}>Precise Solutions</Text>
                    <Text style={[styles.cardDescription, { color: '#4a5568' }]}>Get step-by-step solutions that actually make sense. No more confusion, just clarity.</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
              {/* Doubt Support Card */}
              <TouchableOpacity
                style={styles.featureCard}
                onPress={handleFeaturePress}
                activeOpacity={0.9}
              >
                <BlurView intensity={20} style={styles.glassCard}>
                  <LinearGradient
                    colors={['#f0fff0', '#f8fafc']}
                    style={styles.cardGradient}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: '#f0fff0' }]}> 
                      <Text style={[styles.iconText, { color: '#3b3b3b' }]}>🧠</Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: '#2d3748' }]}>Instant Doubt Clearing</Text>
                    <Text style={[styles.cardDescription, { color: '#4a5568' }]}>Stuck on a concept? Get your doubts cleared instantly. Your personal JEE mentor.</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Storytelling Section: Connection, Subconscious, Hopes, Authenticity */}
          <View style={{ paddingHorizontal: 24, marginTop: 48, marginBottom: 24 }}>
            <LinearGradient
              colors={['#f8fafc', '#e0e7ff', '#fffbe6']}
              style={{ borderRadius: 20, padding: 24 }}
            >
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#2d3748', marginBottom: 12, textAlign: 'center' }}>
                More Than Just an App
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', marginBottom: 8, textAlign: 'center' }}>
                Every person preparing for JEE is more than a student—they are a dreamer, a believer, a seeker of connection. This app is built on the hope that your journey is not just about marks, but about growth, resilience, and authenticity.
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', marginBottom: 8, textAlign: 'center' }}>
                We believe in the power of the subconscious mind—your daily efforts, your small wins, and your moments of doubt all shape your success. Here, you are not alone. You are part of a community of people who share your hopes and your struggles.
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', textAlign: 'center' }}>
                This is a space for real people, real hopes, and real progress. Welcome to a journey that honors your story.
              </Text>
            </LinearGradient>
          </View>

          {/* How It Works Section */}
          <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
            <LinearGradient
              colors={['#e0e7ff', '#f0fff0']}
              style={{ borderRadius: 20, padding: 24 }}
            >
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#2d3748', marginBottom: 12, textAlign: 'center' }}>
                How It Works
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', marginBottom: 8, textAlign: 'center' }}>
                1. Choose a topic or let the app suggest one for you.
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', marginBottom: 8, textAlign: 'center' }}>
                2. Instantly receive a set of questions and solutions tailored to your needs.
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', marginBottom: 8, textAlign: 'center' }}>
                3. Stuck? Use the instant doubt clearing feature to get help, anytime.
              </Text>
              <Text style={{ fontSize: 16, color: '#4a5568', textAlign: 'center' }}>
                4. Track your progress, revisit your journey, and grow with every session.
              </Text>
            </LinearGradient>
          </View>

          {/* Motivation Section */}
          <View style={styles.motivationSection}>
            <BlurView intensity={15} style={styles.motivationCard}>
              <LinearGradient
                colors={['#e0e7ff', '#fffbe6']}
                style={styles.motivationGradient}
              >
                <Text style={styles.motivationTitle}>
                  "Every IITian was once where you are now"
                </Text>
                <Text style={styles.motivationText}>
                  The difference? They had the right tools, the right guidance, and the determination to never give up. 
                  <Text style={{ color: '#43e97b', fontWeight: '700' }}>This app is your tool. Your determination is already there.</Text>
                </Text>
                <Text style={styles.motivationSignature}>
                  — Built by JEE Toppers, for Future Toppers
                </Text>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Bottom CTA */}
          <View style={styles.bottomCTA}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.secondaryButtonBlur}>
                <Text style={[styles.secondaryButtonText, { color: '#7f9cf5' }]}>Begin Your Preparation</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    minHeight: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a202c', // dark gray for readability
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 50,
  },
  heroTitleAccent: {
    color: '#2563eb', // deep blue accent
    textShadowColor: 'rgba(37, 99, 235, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#374151', // dark slate
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ctaGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#2563eb', // fallback
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a202c', // dark gray
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff', // white card
    borderWidth: 1,
    borderColor: '#e5e7eb', // light border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
    color: '#2563eb', // blue icon
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a202c', // dark gray
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#374151', // dark slate
    lineHeight: 22,
  },
  motivationSection: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  motivationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9', // very light blue
  },
  motivationGradient: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  motivationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563eb', // blue
    textAlign: 'center',
    marginBottom: 16,
  },
  motivationText: {
    fontSize: 16,
    color: '#374151', // dark slate
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  motivationSignature: {
    fontSize: 14,
    color: '#64748b', // muted blue-gray
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomCTA: {
    paddingHorizontal: 24,
    marginTop: 40,
    alignItems: 'center',
  },
  secondaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2563eb',
  },
  secondaryButtonBlur: {
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 0,
    backgroundColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

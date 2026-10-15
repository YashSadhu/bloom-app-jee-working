import React from 'react';
import { Image } from 'react-native';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

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
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/images/grain.png')}
          style={styles.grainOverlay}
          resizeMode="repeat"
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                While You're Solving The Same Old Problems,{'\n'}
                <Text style={styles.heroTitleAccent}>Smart JEE Students Are Using This</Text>
              </Text>
              
              <Text style={styles.heroSubtitle}>
                Every day, 1000+ students generate custom tests that match EXACTLY what they need to practice. 
                They're not wasting time on topics they already know. They're attacking their weak spots with surgical precision.
              </Text>
              
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Join 10,000+ Students Who Study Smarter, Not Harder</Text>
                  <Text style={styles.ctaSubtext}>Start Your First Custom Test →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trust Builders */}
          <View style={styles.trustSection}>
            <View style={styles.trustGrid}>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>⚡</Text>
                <Text style={styles.trustText}>Instant test generation</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>🎯</Text>
                <Text style={styles.trustText}>100% syllabus accuracy</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>📈</Text>
                <Text style={styles.trustText}>Used by toppers</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>📊</Text>
                <Text style={styles.trustText}>Detailed test analysis</Text>
              </View>
            </View>
          </View>

          {/* Testimonials Section */}
          <View style={styles.testimonialsSection}>
            <Text style={styles.sectionTitle}>What JEE Toppers Say</Text>
            
            {/* Kalpit Veerwal Testimonial */}
            <View style={styles.testimonialCard}>
              <BlurView intensity={10} style={styles.testimonialBlur}>
                <View style={styles.testimonialContent}>
                  <View style={styles.testimonialHeader}>
                    <Text style={styles.testimonialName}>Kalpit Veerwal</Text>
                    <Text style={styles.testimonialAchievement}>JEE Main AIR 1, 2017 • 360/360</Text>
                  </View>
                  <Text style={styles.testimonialQuote}>
                    "Smart work is much more important than hard work. If you are studying for long hours but not in the right direction, it won't help."
                  </Text>
                </View>
              </BlurView>
            </View>

            {/* Bhavik Bansal Testimonial */}
            <View style={styles.testimonialCard}>
              <BlurView intensity={10} style={styles.testimonialBlur}>
                <View style={styles.testimonialContent}>
                  <View style={styles.testimonialHeader}>
                    <Text style={styles.testimonialName}>Bhavik Bansal</Text>
                    <Text style={styles.testimonialAchievement}>NEET AIR 2, 2019</Text>
                  </View>
                  <Text style={styles.testimonialQuote}>
                    "Consistency and analyzing my mistakes were more important than just doing more questions. I made sure to revisit weak areas until they felt easy."
                  </Text>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Everything You Need to Dominate JEE</Text>
            
            <View style={styles.featuresGrid}>
              {/* AI Generation Card */}
              <TouchableOpacity
                style={styles.featureCard}
                onPress={handleFeaturePress}
                activeOpacity={0.9}
              >
                <BlurView intensity={15} style={styles.featureBlur}>
                  <View style={styles.featureContent}>
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureIconText}>🤖</Text>
                    </View>
                    <Text style={styles.featureTitle}>AI-Powered Question Generation</Text>
                    <Text style={styles.featureDescription}>
                      Select your weak topics and get instant, personalized questions. No more generic practice sets.
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>

              {/* Precision Analysis Card */}
              <TouchableOpacity
                style={styles.featureCard}
                onPress={handleFeaturePress}
                activeOpacity={0.9}
              >
                <BlurView intensity={15} style={styles.featureBlur}>
                  <View style={styles.featureContent}>
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureIconText}>📊</Text>
                    </View>
                    <Text style={styles.featureTitle}>Surgical Precision Analysis</Text>
                    <Text style={styles.featureDescription}>
                      Get detailed breakdowns of your performance. Know exactly where you're losing marks and why.
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>

              {/* Instant Solutions Card */}
              <TouchableOpacity
                style={styles.featureCard}
                onPress={handleFeaturePress}
                activeOpacity={0.9}
              >
                <BlurView intensity={15} style={styles.featureBlur}>
                  <View style={styles.featureContent}>
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureIconText}>⚡</Text>
                    </View>
                    <Text style={styles.featureTitle}>Instant Step-by-Step Solutions</Text>
                    <Text style={styles.featureDescription}>
                      Don't just see the answer. Understand the complete solution path with detailed explanations.
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Final CTA */}
          <View style={styles.finalCTA}>
            <View style={styles.ctaCard}>
              <BlurView intensity={20} style={styles.ctaCardBlur}>
                <View style={styles.ctaCardContent}>
                  <Text style={styles.ctaCardTitle}>Ready to Study Like a Topper?</Text>
                  <Text style={styles.ctaCardSubtitle}>
                    Join thousands of students who've already discovered the smarter way to prepare for JEE.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.finalCtaButton}
                    onPress={handleGetStarted}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#6366f1', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.finalCtaGradient}
                    >
                      <Text style={styles.finalCtaText}>Start Your Journey to Success</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  grainOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    // Subtle grain texture effect using image
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    minHeight: height * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width * 0.95,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  heroTitleAccent: {
    color: '#6366f1',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  ctaGradient: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  ctaSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  trustSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  trustItem: {
    alignItems: 'center',
    width: (width - 80) / 2,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  trustIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  trustText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  testimonialsSection: {
    paddingHorizontal: 24,
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  testimonialCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  testimonialBlur: {
    borderRadius: 20,
  },
  testimonialContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  testimonialHeader: {
    marginBottom: 16,
  },
  testimonialName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  testimonialAchievement: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  testimonialQuote: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 50,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  featureBlur: {
    borderRadius: 20,
  },
  featureContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconText: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  finalCTA: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  ctaCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaCardBlur: {
    borderRadius: 24,
  },
  ctaCardContent: {
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  ctaCardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaCardSubtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  finalCtaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  finalCtaGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  finalCtaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

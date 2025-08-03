import React from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Header, 
  Quote, 
  ActionButton, 
  Footer, 
  Background 
} from '../components/landing';

export default function LandingScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Background>
        <View style={styles.content}>
          <Header 
            appName="JEE Companion" 
            tagline="Your path to excellence" 
          />
          
          <Quote 
            mainQuote="JEE isn't fought in coaching centers.\nIt's won inside YOUR mind.\nArm it."
            highlightedWords={["YOUR", "Arm it."]}
            subText="Prepare smarter. Practice better. Succeed faster."
          />

          <View style={styles.buttonsContainer}>
            <ActionButton
              title="Practice CBT Questions"
              icon="document-text-outline"
              onPress={() => navigation.navigate('CBTExam')}
              isPrimary={true}
            />

            <ActionButton
              title="Study Progress Dashboard"
              icon="analytics-outline"
              onPress={() => navigation.navigate('StudyDashboard')}
              isPrimary={false}
            />
          </View>
          
          <Footer text="Master every concept. Achieve your dreams." />
          
          {/* Decorative elements */}
          <Image 
            source={{ uri: 'https://api.a0.dev/assets/image?text=abstract%20geometric%20shapes%20in%20blue%20and%20white&aspect=1:1&seed=123' }}
            style={styles.decorativeElement1}
          />
          
          <Image 
            source={{ uri: 'https://api.a0.dev/assets/image?text=abstract%20geometric%20shapes%20in%20blue%20and%20white&aspect=1:1&seed=456' }}
            style={styles.decorativeElement2}
          />
        </View>
      </Background>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d6e8c',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    position: 'relative',
    zIndex: 1,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    maxWidth: 400,
  },
  decorativeElement1: {
    position: 'absolute',
    width: 150,
    height: 150,
    opacity: 0.15,
    top: '10%',
    left: -50,
    zIndex: -1,
    borderRadius: 75,
  },
  decorativeElement2: {
    position: 'absolute',
    width: 180,
    height: 180,
    opacity: 0.1,
    bottom: '15%',
    right: -70,
    zIndex: -1,
    borderRadius: 90,
  },
});
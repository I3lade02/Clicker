import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native'; 
import { GameProvider } from './src/state/GameContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <GameProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar style='light' />
        <HomeScreen />
      </SafeAreaView>
    </GameProvider>
  );
}
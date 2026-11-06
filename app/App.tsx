import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from './src/theme/tokens';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Vask<Text style={styles.logoAccent}>o</Text>
      </Text>
      <Text style={styles.tagline}>Tid til det som betyr noe</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    fontSize: 48,
    color: colors.navy,
  },
  logoAccent: {
    color: colors.cognac,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.textMuted,
  },
});

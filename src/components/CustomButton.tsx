import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface CustomButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  buttonColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  mode = 'contained',
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  style,
  buttonColor,
}) => {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      buttonColor={buttonColor || (mode === 'contained' ? theme.colors.primary : undefined)}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  content: {
    height: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CustomButton;

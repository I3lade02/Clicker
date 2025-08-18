import React from 'react';
import { Text } from 'react-native';
import { colors } from '../constants/colors';

export default function SectionTitle({ children, style }) {
    return (
        <Text style={[{ color: colors.info, fontWeight: "700", marginTop: 6, marginBottom: 4}, style]}>
            {children}
        </Text>
    );
}
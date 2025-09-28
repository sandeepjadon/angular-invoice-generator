import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const ApPreset = definePreset(Aura, {
    semantic: {
        primary: {
            // A professional, muted slate blue palette
            50: '#F0F6FF',
            100: '#E0EDFF',
            200: '#C2DAFF',
            300: '#A3C8FF',
            400: '#85B6FF',
            500: '#67A3FF',
            600: '#4F8DFA',
            700: '#3778F5',
            800: '#2063F0',
            900: '#184DB8',
            950: '#10377A'
        },
        surface: {
            // A clean, neutral surface palette
            0: '#ffffff',     // White
            50: '#f8fafc',    // Page Background
            100: '#f1f5f9',   // Card Background / Borders
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',   // Text
            800: '#1e293b',   // Text
            900: '#0f172a',   // Headings
            950: '#020617'
        }
    }
});

export default ApPreset;

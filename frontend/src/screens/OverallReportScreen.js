import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { ChevronDown } from 'lucide-react-native';
import api from '../api';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const OverallReportScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/overall');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('FETCH STATS ERROR:', error);
      setLoading(false);
    }
  };

  const renderDonut = (total) => {
    if (!stats || total === 0) return null;
    
    const radius = 70;
    const strokeWidth = 50;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    const data = [
      { label: 'Male', value: stats.male, color: '#F59E0B' },
      { label: 'Female', value: stats.female, color: '#10B981' },
      { label: 'Kids', value: stats.kids0_3 + stats.kids3_6 + stats.kids6_9, color: '#3B82F6' },
    ].filter(d => d.value > 0);

    let currentAngle = -90;

    return (
      <Svg height="200" width="200" viewBox="0 0 200 200">
        <G transform={`rotate(0, ${center}, ${center})`}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDashoffset = circumference - (circumference * percentage) / 100;
            const rotation = currentAngle;
            currentAngle += (percentage / 100) * 360;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                fill="transparent"
                transform={`rotate(${rotation}, ${center}, ${center})`}
              />
            );
          })}
          <Circle cx={center} cy={center} r={45} fill={theme.colors.surface} />
          
          <SvgText
            x={center}
            y={center - 10}
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill={theme.colors.text}
          >
            Total
          </SvgText>
          <SvgText
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill={theme.colors.text}
          >
            {total}
          </SvgText>
        </G>
      </Svg>
    );
  };

  const StatRow = ({ label, value, color, onPress, half }) => (
    <TouchableOpacity 
      style={[styles.statRow, { backgroundColor: color, width: half ? '48%' : '100%', ...theme.shadow.sm }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Animal Report" subTitle="Overall Records" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={[styles.chartCard, { backgroundColor: theme.colors.surface, ...theme.shadow.md }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Inventory Status</Text>
            <View style={styles.chartContainer}>
              {renderDonut(stats.total)}
            </View>
            
            <View style={styles.legendGrid}>
               {[
                { label: 'Male', color: '#F59E0B' },
                { label: 'Female', color: '#10B981' },
                { label: 'Breeder', color: '#06B6D4' },
                { label: 'Pregnant', color: '#EF4444' },
                { label: 'Kids(0-3)', color: '#3B82F6' },
                { label: 'Kids(3-6)', color: '#8B5CF6' },
                { label: 'Kids(6-9)', color: '#FACC15' },
               ].map((item, idx) => (
                 <View key={idx} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textLight }]}>{item.label}</Text>
                 </View>
               ))}
            </View>
          </View>

          <View style={styles.listSection}>
            <StatRow 
              label="Total Animal" 
              value={stats.total} 
              color="#4F46E5" 
              onPress={() => navigation.navigate('AnimalList')}
            />
            <View style={styles.gridRow}>
                <StatRow 
                    label="Male" 
                    value={stats.male} 
                    color="#F59E0B" 
                    half
                    onPress={() => navigation.navigate('AnimalList', { gender: 'MALE' })}
                />
                <StatRow 
                    label="Female" 
                    value={stats.female} 
                    color="#10B981" 
                    half
                    onPress={() => navigation.navigate('AnimalList', { gender: 'FEMALE' })}
                />
            </View>
            <View style={styles.gridRow}>
                <StatRow 
                    label="Breeder" 
                    value={stats.breeder} 
                    color="#06B6D4" 
                    half
                    onPress={() => navigation.navigate('AnimalList', { isBreeder: true })}
                />
                <StatRow 
                    label="Pregnant" 
                    value={stats.pregnant} 
                    color="#EF4444" 
                    half
                    onPress={() => navigation.navigate('AnimalList', { femaleCondition: 'PREGNANT' })}
                />
            </View>
            <StatRow 
              label="Kids (0 - 3 months)" 
              value={stats.kids0_3} 
              color="#3B82F6" 
              onPress={() => navigation.navigate('AnimalList', { ageRange: '0-3' })}
            />
            <StatRow 
              label="Kids (3 - 6 months)" 
              value={stats.kids3_6} 
              color="#8B5CF6" 
              onPress={() => navigation.navigate('AnimalList', { ageRange: '3-6' })}
            />
            <StatRow 
              label="Kids (6 - 9 months)" 
              value={stats.kids6_9} 
              color="#FACC15" 
              onPress={() => navigation.navigate('AnimalList', { ageRange: '6-9' })}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    margin: 16,
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
  },
  chartTitle: {
    alignSelf: 'flex-start',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  chartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listSection: {
    paddingHorizontal: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
    borderRadius: 20,
  },
  statLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default OverallReportScreen;

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { ChevronDown } from 'lucide-react-native';
import api from '../api';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const OverallReportScreen = ({ navigation }) => {
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

    // We'll just show 2 segments (Male vs Female) for simplicity in the donut, 
    // or all of them. The image shows a few segments.
    // Let's do a few.
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
          {/* Inner circle to make it a donut */}
          <Circle cx={center} cy={center} r={45} fill="white" />
          
          <SvgText
            x={center}
            y={center - 10}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill={COLORS.text}
          >
            Total
          </SvgText>
          <SvgText
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill={COLORS.text}
          >
            {total}
          </SvgText>
        </G>
      </Svg>
    );
  };

  const StatRow = ({ label, value, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statRow, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <GHeader title="Overall Report" onBack={() => navigation.goBack()} />
        <View style={styles.typeSelector}>
          <Text style={styles.typeText}>Goat</Text>
          <ChevronDown size={16} color="white" />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.flex}>
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Current Status</Text>
            <View style={styles.chartContainer}>
              {renderDonut(stats.total)}
            </View>
            
            <View style={styles.legendGrid}>
               {[
                { label: 'Male', color: '#F59E0B' },
                { label: 'Female', color: '#10B981' },
                { label: 'Breeder', color: '#06B6D4' },
                { label: 'Pregnant', color: '#EF4444' },
                { label: 'Kids(0-3m)', color: '#3B82F6' },
                { label: 'Kids(3-6m)', color: '#8B5CF6' },
                { label: 'Kids(6-9m)', color: '#FACC15' },
               ].map((item, idx) => (
                 <View key={idx} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                 </View>
               ))}
            </View>
          </View>

          <View style={styles.listSection}>
            <StatRow 
              label="Total Animal" 
              value={stats.total} 
              color="#1E40AF" 
              onPress={() => navigation.navigate('AnimalList')}
            />
            <StatRow 
              label="Male" 
              value={stats.male} 
              color="#F59E0B" 
              onPress={() => navigation.navigate('AnimalList', { gender: 'MALE' })}
            />
            <StatRow 
              label="Female" 
              value={stats.female} 
              color="#10B981" 
              onPress={() => navigation.navigate('AnimalList', { gender: 'FEMALE' })}
            />
            <StatRow 
              label="Breeder" 
              value={stats.breeder} 
              color="#06B6D4" 
              onPress={() => navigation.navigate('AnimalList', { isBreeder: true })}
            />
            <StatRow 
              label="Pregnant" 
              value={stats.pregnant} 
              color="#EF4444" 
              onPress={() => navigation.navigate('AnimalList', { femaleCondition: 'PREGNANT' })}
            />
            <StatRow 
              label="Kids(0 - 3 months)" 
              value={stats.kids0_3} 
              color="#3B82F6" 
              onPress={() => navigation.navigate('AnimalList', { ageRange: '0-3' })}
            />
            <StatRow 
              label="Kids(3 - 6 months)" 
              value={stats.kids3_6} 
              color="#8B5CF6" 
              onPress={() => navigation.navigate('AnimalList', { ageRange: '3-6' })}
            />
            <StatRow 
              label="Kids(6 - 9 months)" 
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
    backgroundColor: 'white',
  },
  headerWrapper: {
    zIndex: 10,
    backgroundColor: COLORS.primary,
  },
  typeSelector: {
    position: 'absolute',
    right: 16,
    top: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  typeText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSection: {
    padding: 20,
    alignItems: 'center',
  },
  chartTitle: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  chartContainer: {
    height: 220,
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
    fontSize: 11,
    color: '#6B7280',
  },
  listSection: {
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 4,
  },
  statLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OverallReportScreen;

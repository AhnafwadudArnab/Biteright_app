// import { ArrowLeft, Calendar, Grid, LineChart, PieChart, RefreshCw, Trash2, TrendingDown } from 'lucide-react-native';
// import { useState } from 'react';
// import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';


// interface HealthInsightsScreenProps {
//   onNavigate: (screen: string) => void;
// }

// const macroData = [28, 48, 24];
// const macroColors = ['#3BB273', '#60d394', '#aaf683'];

// const weightData = [75, 74.5, 74.2, 73.8];

// const reports = [
//   { date: 'Dec 1 - Dec 7', calories: 1950, status: 'On Track' },
//   { date: 'Nov 24 - Nov 30', calories: 2100, status: 'Above Target' },
//   { date: 'Nov 17 - Nov 23', calories: 1880, status: 'On Track' }
// ];

// export function HealthInsightsScreen({ onNavigate }: HealthInsightsScreenProps) {
//   const [view, setView] = useState<'dashboard' | 'generate' | 'history'>('dashboard');

//   if (view === 'generate') {
//     return (
//       <ScrollView style={styles.container}>
//         <Pressable onPress={() => setView('dashboard')}>
//           <ArrowLeft size={24} />
//         </Pressable>

//         <Text style={styles.title}>Generate Report</Text>

//         {[
//           'Calorie intake trends',
//           'Macro breakdown',
//           'Weight progress',
//           'Meal frequency',
//           'Water intake'
//         ].map(item => (
//           <View key={item} style={styles.row}>
//             <Text>{item}</Text>
//             <Switch value />
//           </View>
//         ))}

//         <Pressable style={styles.primaryBtn} onPress={() => setView('dashboard')}>
//           <Text style={styles.primaryText}>Generate Report</Text>
//         </Pressable>
//       </ScrollView>
//     );
//   }

//   if (view === 'history') {
//     return (
//       <ScrollView style={styles.container}>
//         <Pressable onPress={() => setView('dashboard')}>
//           <ArrowLeft size={24} />
//         </Pressable>

//         <Text style={styles.title}>Report History</Text>

//         {reports.map((report, index) => (
//           <View key={index} style={styles.card}>
//             <Text>{report.date}</Text>
//             <Text>{report.calories} kcal/day</Text>
//             <Pressable>
//               <Trash2 size={18} color="red" />
//             </Pressable>
//           </View>
//         ))}
//       </ScrollView>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Pressable onPress={() => onNavigate('home')}>
//         <ArrowLeft size={24} />
//       </Pressable>

//       <View style={styles.header}>
//         <Text style={styles.title}>Health Insights</Text>
//         <Pressable onPress={() => setView('history')} style={styles.row}>
//           <Calendar size={18} />
//           <Text>History</Text>
//         </Pressable>
//       </View>

//       <View style={styles.summaryCard}>
//         <Text style={styles.whiteText}>Average Daily Calories</Text>
//         <Text style={styles.bigWhite}>1,950 kcal</Text>
//         <View style={styles.row}>
//           <TrendingDown size={16} color="white" />
//           <Text style={styles.whiteText}>50 kcal below target</Text>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>Macro Breakdown</Text>
//       <PieChart
//         style={{ height: 200 }}
//         data={macroData.map((value, index) => ({
//           value,
//           svg: { fill: macroColors[index] },
//           key: index
//         }))}
//       />

//       <Text style={styles.sectionTitle}>Weight Trend</Text>
//       <LineChart
//         style={{ height: 200 }}
//         data={weightData}
//         svg={{ stroke: '#3BB273', strokeWidth: 3 }}
//         contentInset={{ top: 20, bottom: 20 }}
//       >
//         <Grid />
//       </LineChart>

//       <View style={styles.row}>
//         <Pressable style={styles.primaryBtn} onPress={() => setView('generate')}>
//           <RefreshCw size={18} color="white" />
//           <Text style={styles.primaryText}>New Report</Text>
//         </Pressable>
//         <Pressable style={styles.secondaryBtn} onPress={() => setView('history')}>
//           <Text>View History</Text>
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff'
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginVertical: 12
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginVertical: 8
//   },
//   card: {
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginVertical: 6
//   },
//   summaryCard: {
//     backgroundColor: '#3BB273',
//     borderRadius: 16,
//     padding: 16,
//     marginVertical: 12
//   },
//   whiteText: {
//     color: 'white'
//   },
//   bigWhite: {
//     fontSize: 32,
//     color: 'white',
//     fontWeight: 'bold'
//   },
//   sectionTitle: {
//     fontSize: 18,
//     marginVertical: 10
//   },
//   primaryBtn: {
//     backgroundColor: '#3BB273',
//     padding: 14,
//     borderRadius: 14,
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 6
//   },
//   primaryText: {
//     color: 'white',
//     fontWeight: '600'
//   },
//   secondaryBtn: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 14,
//     borderRadius: 14
//   }
// });





import React, { useState } from 'react';
import { 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Switch, 
  Text, 
  View, 
  Alert 
} from 'react-native';
import { 
  ArrowLeft, 
  Calendar, 
  Grid, 
  LineChart, 
  PieChart, 
  RefreshCw, 
  Trash2, 
  TrendingDown 
} from 'lucide-react-native';

interface UserMacro {
  carbs: number;
  protein: number;
  fat: number;
}

interface UserReport {
  id: string;
  dateRange: string;
  calories: number;
  status: string;
}

interface HealthInsightsProps {
  userData: {
    calories: number;
    macro: UserMacro;
    weightHistory: number[];
    reports: UserReport[];
  };
  onNavigate: (screen: string) => void;
}

export function HealthInsights({ userData, onNavigate }: HealthInsightsProps) {
  const [view, setView] = useState<'dashboard' | 'generate' | 'history'>('dashboard');
  const [reports, setReports] = useState<UserReport[]>(userData.reports || []);

  const macroData = [
    userData.macro.carbs,
    userData.macro.protein,
    userData.macro.fat
  ];
  const macroColors = ['#3BB273', '#60d394', '#aaf683'];

  const weightData = userData.weightHistory;

  // Generate new report
  const handleGenerateReport = () => {
    const newReport: UserReport = {
      id: String(Date.now()),
      dateRange: "Jan 18 - Jan 24",
      calories: Math.floor(userData.calories * (0.9 + Math.random() * 0.2)), // random around target
      status: "On Track"
    };
    setReports(prev => [newReport, ...prev]);
    setView('dashboard');
  };

  // Delete a report
  const handleDeleteReport = (id: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => setReports(prev => prev.filter(r => r.id !== id))
        }
      ]
    );
  };

  // --- Generate Report Screen ---
  if (view === 'generate') {
    return (
      <ScrollView style={styles.container}>
        <Pressable onPress={() => setView('dashboard')} style={{ marginBottom: 12 }}>
          <ArrowLeft size={24} />
        </Pressable>

        <Text style={styles.title}>Generate Report</Text>

        {['Calorie intake trends', 'Macro breakdown', 'Weight progress', 'Meal frequency', 'Water intake'].map(item => (
          <View key={item} style={styles.row}>
            <Text>{item}</Text>
            <Switch value={true} /> {/* default ON */}
          </View>
        ))}

        <Pressable style={styles.primaryBtn} onPress={handleGenerateReport}>
          <Text style={styles.primaryText}>Generate Report</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // --- History Screen ---
  if (view === 'history') {
    return (
      <ScrollView style={styles.container}>
        <Pressable onPress={() => setView('dashboard')} style={{ marginBottom: 12 }}>
          <ArrowLeft size={24} />
        </Pressable>

        <Text style={styles.title}>Report History</Text>

        {reports.length === 0 && <Text>No reports available</Text>}

        {reports.map(report => (
          <View key={report.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '500' }}>{report.dateRange}</Text>
                <Text>{report.calories} kcal/day</Text>
                <Text>Status: {report.status}</Text>
              </View>
              <Pressable onPress={() => handleDeleteReport(report.id)}>
                <Trash2 size={18} color="red" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  // --- Dashboard Screen ---
  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={() => onNavigate('home')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={24} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Health Insights</Text>
        <Pressable onPress={() => setView('history')} style={styles.row}>
          <Calendar size={18} />
          <Text>History</Text>
        </Pressable>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.whiteText}>Average Daily Calories</Text>
        <Text style={styles.bigWhite}>{userData.calories} kcal</Text>
        <View style={styles.row}>
          <TrendingDown size={16} color="white" />
          <Text style={styles.whiteText}>50 kcal below target</Text>
        </View>
      </View>

      {/* Macro Breakdown */}
      <Text style={styles.sectionTitle}>Macro Breakdown</Text>
      <PieChart
        style={{ height: 200 }}
        data={macroData.map((value, index) => ({
          value,
          svg: { fill: macroColors[index] },
          key: `macro-${index}`
        }))}
      />

      {/* Weight Trend */}
      <Text style={styles.sectionTitle}>Weight Trend</Text>
      <LineChart
        style={{ height: 200 }}
        data={weightData}
        svg={{ stroke: '#3BB273', strokeWidth: 3 }}
        contentInset={{ top: 20, bottom: 20 }}
      >
        <Grid />
      </LineChart>

      {/* Actions */}
      <View style={[styles.row, { marginTop: 16 }]}>
        <Pressable style={styles.primaryBtn} onPress={() => setView('generate')}>
          <RefreshCw size={18} color="white" />
          <Text style={styles.primaryText}>New Report</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => setView('history')}>
          <Text>View History</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 6
  },
  summaryCard: {
    backgroundColor: '#3BB273',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12
  },
  whiteText: {
    color: 'white'
  },
  bigWhite: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10
  },
  primaryBtn: {
    backgroundColor: '#3BB273',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6
  },
  primaryText: {
    color: 'white',
    fontWeight: '600'
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 14
  }
});

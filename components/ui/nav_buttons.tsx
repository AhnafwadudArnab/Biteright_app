import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const icons = [
  { name: 'home', lib: Ionicons },
  { name: 'bar-chart', lib: Ionicons },
  { name: 'run', lib: MaterialIcons },
  { name: 'call', lib: Ionicons },
  { name: 'person', lib: Ionicons },
];

const NavButtons: React.FC = () => {
  return (
    <View style={styles.fabContainer}>
      <View style={styles.fabBar}>
        {icons.map((icon, idx) => {
          const IconComp = icon.lib;
          const isActive = idx === 0;
          return (
            <TouchableOpacity
              key={icon.name}
              style={[styles.fabBtn, isActive && styles.fabBtnActive]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <IconComp
                name={icon.name as any}
                size={22}
                color={isActive ? '#fff' : '#222'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
    zIndex: 100,
  },
  fabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
  },
  fabBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  fabBtnActive: {
    backgroundColor: '#A99CF8',
  },
});

export default NavButtons;

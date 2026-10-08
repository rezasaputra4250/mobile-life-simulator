import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function Header() {
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        backgroundColor: '#0F172A',
      }}>
      <View
        style={{
          height: 60,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0F172A',
        }}>
        <View>
          <Text
            style={{
              color: '#FFD700',
              fontSize: 22,
              fontWeight: 'bold',
            }}>
            ⚔️ RPG LIFE
          </Text>

          <Text
            style={{
              color: '#94A3B8',
              fontSize: 12,
            }}>
            Level 12 Warrior
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="cash-outline"
            size={20}
            color="#FFD700"
          />
          <Text
            style={{
              color: '#FFD700',
              marginLeft: 5,
              fontWeight: '600',
            }}>
            1,250
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,

        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarShowLabel: true,

        tabBarStyle: {
          backgroundColor: '#1E293B',

          borderTopWidth: 0,

          height: 60 + insets.bottom,

          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,

          elevation: 15,

          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: -2,
          },
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
        },

        sceneStyle: {
          backgroundColor: '#020617',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="quest"
        options={{
          title: 'Quest',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="list"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="guild"
        options={{
          title: 'Guild',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="people"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="bag"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
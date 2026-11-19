import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const COLORS = {
  black: '#0B0B0B',
  charcoal: '#151515',
  card: '#202020',
  gold: '#D4B76A',
  white: '#FFFFFF',
  grey: '#A0A0A0',
  red: '#D9534F',
};

const COURSES = ['Starter', 'Main', 'Dessert'];
const CURRENCIES = ['R', '$', '£'];

export default function App() {
  const [screen, setScreen] = useState('Dashboard');
  const [dishes, setDishes] = useState([]);

  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('Starter');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('R');
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

 // DASHBOARD STATISTICS

  const totalDishes = dishes.length;

  const courseCounts = {
    Starter: dishes.filter(d => d.course === 'Starter').length,
    Main: dishes.filter(d => d.course === 'Main').length,
    Dessert: dishes.filter(d => d.course === 'Dessert').length,
  };

  const averagePrices = CURRENCIES.map(symbol => {
    const items = dishes.filter(d => d.currency === symbol);

    const average = items.length
      ? items.reduce((sum, d) => sum + Number(d.price), 0) / items.length
      : 0;

    return {
      currency: symbol,
      average: average.toFixed(2),
      count: items.length,
    };
  });

// FORM FUNCTIONS

  function resetForm() {
    setDishName('');
    setDescription('');
    setCourse('Starter');
    setPrice('');
    setCurrency('R');
    setEditingId(null);
  }

  function openAddDish() {
    resetForm();
    setScreen('AddDish');
  }

  function openEditDish(dish) {
    setDishName(dish.name);
    setDescription(dish.description);
    setCourse(dish.course);
    setPrice(String(dish.price));
    setCurrency(dish.currency);
    setEditingId(dish.id);
    setScreen('AddDish');
  }

  function saveDish() {
    if (!dishName.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Missing Information', 'Please complete all fields.');
      return;
    }

    const cleanPrice = Number(price.replace(',', '.'));

    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than zero.');
      return;
    }

    const dishData = {
      id: editingId || Date.now().toString(),
      name: dishName.trim(),
      description: description.trim(),
      course,
      price: cleanPrice,
      currency,
    };

    if (editingId) {
      setDishes(previous =>
        previous.map(d => d.id === editingId ? dishData : d)
      );

      Alert.alert('Success', 'Dish updated successfully!');
    } else {
      setDishes(previous => [...previous, dishData]);

      Alert.alert('Success', 'Dish added successfully!');
    }

    resetForm();
    setScreen(editingId ? 'ManageMenu' : 'Dashboard');
  }

 // DELETE FUNCTION

  function deleteDish(id) {
    Alert.alert(
      'Delete Dish',
      'Are you sure you want to delete this dish?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDishes(previous =>
              previous.filter(d => d.id !== id)
            );

            Alert.alert('Deleted', 'Dish removed successfully.');
          },
        },
      ]
    );
  }

// SEARCH AND FILTER

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCourse =
      filterCourse === 'All' || dish.course === filterCourse;

    return matchesSearch && matchesCourse;
  });

  function clearFilters() {
    setSearch('');
    setFilterCourse('All');
  }

 // REUSABLE BUTTON

  function ActionButton({ title, onPress, secondary, danger }) {
    return (
      <Pressable
        style={[
          styles.button,
          secondary && styles.secondaryButton,
          danger && styles.dangerButton,
        ]}
        onPress={onPress}
      >
        <Text style={[
          styles.buttonText,
          secondary && styles.secondaryText,
        ]}>
          {title}
        </Text>
      </Pressable>
    );
  }

// REUSABLE COURSE SELECTOR

  function CourseSelector() {
    return (
      <View style={styles.optionContainer}>
        {COURSES.map(item => (
          <Pressable
            key={item}
            onPress={() => setCourse(item)}
            style={[
              styles.option,
              course === item && styles.selectedOption,
            ]}
          >
            <Text style={[
              styles.optionText,
              course === item && styles.selectedOptionText,
            ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

// REUSABLE DISH CARD

  function DishCard({ dish, showActions = false }) {
    return (
      <View style={styles.dishCard}>
        <View style={styles.dishHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.courseLabel}>{dish.course}</Text>
          </View>

          <Text style={styles.dishPrice}>
            {dish.currency}{Number(dish.price).toFixed(2)}
          </Text>
        </View>

        <Text style={styles.dishDescription}>
          {dish.description}
        </Text>

        {showActions && (
          <View style={styles.actionRow}>
            <Pressable
              style={styles.smallButton}
              onPress={() => openEditDish(dish)}
            >
              <Text style={styles.smallButtonText}>Edit</Text>
            </Pressable>

            <Pressable
              style={[styles.smallButton, styles.deleteButton]}
              onPress={() => deleteDish(dish.id)}
            >
              <Text style={styles.smallButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }


// DASHBOARD SCREEN

  function Dashboard() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>Welcome, Chef!</Text>
        <Text style={styles.subtitle}>
          Manage your private restaurant menu.
        </Text>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL MENU ITEMS</Text>
          <Text style={styles.statNumber}>{totalDishes}</Text>
          <Text style={styles.statDescription}>
            Dishes currently on your menu
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Average Prices</Text>

        <View style={styles.averageContainer}>
          {averagePrices.map(item => (
            <View key={item.currency} style={styles.averageCard}>
              <Text style={styles.averageCurrency}>
                {item.currency}
              </Text>
              <Text style={styles.averageValue}>
                {item.count > 0 ? item.average : '0.00'}
              </Text>
              <Text style={styles.mutedText}>
                {item.count} item(s)
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Items Per Course</Text>

        {COURSES.map(item => (
          <View key={item} style={styles.courseStat}>
            <Text style={styles.courseStatName}>
              {item === 'Main' ? 'Main Course' : item + 's'}
            </Text>
            <Text style={styles.courseStatNumber}>
              {courseCounts[item]}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Menu Management</Text>

        <ActionButton
          title="+ Add New Dish"
          onPress={openAddDish}
        />

        <ActionButton
          title="Manage Menu"
          secondary
          onPress={() => setScreen('ManageMenu')}
        />

        <ActionButton
          title="View Menu"
          secondary
          onPress={() => setScreen('ViewMenu')}
        />
      </ScrollView>
    );
  }

 // MANAGE MENU SCREEN

  function ManageMenu() {
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Manage Menu</Text>

        <TextInput
          style={styles.input}
          placeholder="Search by dish name..."
          placeholderTextColor={COLORS.grey}
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.inputLabel}>Filter by Course</Text>

        <View style={styles.optionContainer}>
          {['All', ...COURSES].map(item => (
            <Pressable
              key={item}
              onPress={() => setFilterCourse(item)}
              style={[
                styles.option,
                filterCourse === item && styles.selectedOption,
              ]}
            >
              <Text style={[
                styles.optionText,
                filterCourse === item && styles.selectedOptionText,
              ]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <ActionButton
          title="Clear Filters"
          secondary
          onPress={clearFilters}
        />

        <Text style={styles.resultText}>
          Showing {filteredDishes.length} of {totalDishes} dishes
        </Text>

        <ActionButton
          title="+ Add New Dish"
          onPress={openAddDish}
        />

        {filteredDishes.length === 0 ? (
          <Text style={styles.emptyText}>
            No dishes found. Try changing your search or filter.
          </Text>
        ) : (
          filteredDishes.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              showActions
            />
          ))
        )}
      </ScrollView>
    );
  }

// VIEW MENU SCREEN

  function ViewMenu() {
    return (
      <ScrollView>
        <Text style={styles.sectionTitle}>Our Menu</Text>
        <Text style={styles.subtitle}>
          Explore our selection of dishes.
        </Text>

        {COURSES.map(item => {
          const courseDishes = dishes.filter(
            dish => dish.course === item
          );

          return (
            <View key={item}>
              <Text style={styles.menuHeading}>
                {item === 'Main' ? 'Main Courses' : item + 's'}
              </Text>

              {courseDishes.length === 0 ? (
                <Text style={styles.emptyText}>
                  No {item.toLowerCase()} dishes available.
                </Text>
              ) : (
                courseDishes.map(dish => (
                  <DishCard key={dish.id} dish={dish} />
                ))
              )}
            </View>
          );
        })}

        <ActionButton
          title="Manage Dishes"
          onPress={() => setScreen('ManageMenu')}
        />
      </ScrollView>
    );
  }

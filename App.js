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
    const items = dishes.filter(
      dish =>
        dish.currency === symbol &&
        Number.isFinite(Number(dish.price))
    );

    const totalPrice = items.reduce(
      (sum, dish) => sum + Number(dish.price),
      0
    );

    const average = items.length > 0
      ? totalPrice / items.length
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
      Alert.alert(
        'Invalid Price',
        'Please enter a valid price greater than zero.'
      );
      return;
    }

    const wasEditing = Boolean(editingId);

    const dishData = {
      id: editingId || Date.now().toString(),
      name: dishName.trim(),
      description: description.trim(),
      course,
      price: cleanPrice,
      currency,
    };

    if (wasEditing) {
      setDishes(previous =>
        previous.map(dish =>
          dish.id === editingId ? dishData : dish
        )
      );

      Alert.alert('Success', 'Dish updated successfully!');
    } else {
      setDishes(previous => [...previous, dishData]);

      Alert.alert('Success', 'Dish added successfully!');
    }

    resetForm();
    setScreen(wasEditing ? 'ManageMenu' : 'Dashboard');
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
            setDishes(previousDishes => {
              const updatedDishes = previousDishes.filter(
                dish => String(dish.id) !== String(id)
              );

              return updatedDishes;
            });

            Alert.alert(
              'Success',
              'Dish deleted successfully!'
            );
          },
        },
      ],
      { cancelable: true }
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
                {item.average}
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

  // ADD AND EDIT SCREEN

  function AddDish() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>
            {editingId ? 'Edit Dish' : 'Add New Dish'}
          </Text>

          <Text style={styles.inputLabel}>Dish Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter dish name"
            placeholderTextColor={COLORS.grey}
            value={dishName}
            onChangeText={setDishName}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Describe your dish"
            placeholderTextColor={COLORS.grey}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.inputLabel}>Course</Text>
          <CourseSelector />

          <Text style={styles.inputLabel}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor={COLORS.grey}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text style={styles.inputLabel}>Currency</Text>

          <View style={styles.optionContainer}>
            {CURRENCIES.map(item => (
              <Pressable
                key={item}
                onPress={() => setCurrency(item)}
                style={[
                  styles.option,
                  currency === item && styles.selectedOption,
                ]}
              >
                <Text style={[
                  styles.optionText,
                  currency === item && styles.selectedOptionText,
                ]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <ActionButton
            title={editingId ? 'Update Dish' : 'Save Dish'}
            onPress={saveDish}
          />

          <ActionButton
            title="Cancel"
            secondary
            onPress={() => {
              const wasEditing = Boolean(editingId);
              resetForm();
              setScreen(wasEditing ? 'ManageMenu' : 'Dashboard');
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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

  // MAIN APP LAYOUT

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>CHEF'S</Text>
        <Text style={styles.logoSubtitle}>PRIVATE MENU</Text>
      </View>

      <View style={styles.content}>
        {screen === 'Dashboard' && <Dashboard />}
        {screen === 'AddDish' && <AddDish />}
        {screen === 'ManageMenu' && <ManageMenu />}
        {screen === 'ViewMenu' && <ViewMenu />}
      </View>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => setScreen('Dashboard')}>
          <Text style={[
            styles.navText,
            screen === 'Dashboard' && styles.activeNav,
          ]}>
            Home
          </Text>
        </Pressable>

        <Pressable onPress={() => setScreen('ManageMenu')}>
          <Text style={[
            styles.navText,
            screen === 'ManageMenu' && styles.activeNav,
          ]}>
            Manage
          </Text>
        </Pressable>

        <Pressable onPress={() => setScreen('ViewMenu')}>
          <Text style={[
            styles.navText,
            screen === 'ViewMenu' && styles.activeNav,
          ]}>
            View Menu
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// APP STYLING

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  header: {
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#353535',
  },

  logo: {
    color: COLORS.gold,
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 4,
  },

  logoSubtitle: {
    color: COLORS.white,
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 3,
  },

  content: {
    flex: 1,
    padding: 18,
  },

  welcome: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
  },

  subtitle: {
    color: COLORS.grey,
    fontSize: 14,
    marginTop: 7,
    marginBottom: 18,
  },

  sectionTitle: {
    color: COLORS.gold,
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 14,
  },

  statCard: {
    backgroundColor: COLORS.charcoal,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
  },

  statLabel: {
    color: COLORS.grey,
    fontSize: 12,
    letterSpacing: 2,
  },

  statNumber: {
    color: COLORS.gold,
    fontSize: 42,
    fontWeight: 'bold',
    marginVertical: 5,
  },

  statDescription: {
    color: COLORS.white,
    fontSize: 13,
  },

  averageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 7,
  },

  averageCard: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
    padding: 12,
    borderRadius: 9,
    alignItems: 'center',
  },

  averageCurrency: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },

  averageValue: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
  },

  mutedText: {
    color: COLORS.grey,
    fontSize: 10,
    marginTop: 5,
  },

  courseStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.charcoal,
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
  },

  courseStatName: {
    color: COLORS.white,
    fontSize: 15,
  },

  courseStatNumber: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontSize: 16,
  },

  button: {
    backgroundColor: COLORS.gold,
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginVertical: 7,
  },

  secondaryButton: {
    backgroundColor: COLORS.charcoal,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  dangerButton: {
    backgroundColor: COLORS.red,
  },

  buttonText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: 'bold',
  },

  secondaryText: {
    color: COLORS.gold,
  },

  inputLabel: {
    color: COLORS.gold,
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },

  input: {
    backgroundColor: COLORS.charcoal,
    borderWidth: 1,
    borderColor: '#454545',
    borderRadius: 8,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  option: {
    backgroundColor: COLORS.charcoal,
    borderWidth: 1,
    borderColor: '#454545',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },

  selectedOption: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  optionText: {
    color: COLORS.white,
    fontSize: 13,
  },

  selectedOptionText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },

  resultText: {
    color: COLORS.grey,
    marginVertical: 12,
    fontSize: 13,
  },

  dishCard: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#383838',
  },

  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dishName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },

  courseLabel: {
    color: COLORS.gold,
    fontSize: 12,
    marginTop: 4,
  },

  dishPrice: {
    color: COLORS.gold,
    fontSize: 17,
    fontWeight: 'bold',
  },

  dishDescription: {
    color: COLORS.grey,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  smallButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 6,
  },

  deleteButton: {
    backgroundColor: COLORS.red,
  },

  smallButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },

  emptyText: {
    color: COLORS.grey,
    textAlign: 'center',
    padding: 20,
    fontSize: 13,
  },

  menuHeading: {
    color: COLORS.gold,
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
    paddingBottom: 8,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.charcoal,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#383838',
  },

  navText: {
    color: COLORS.grey,
    fontSize: 13,
    fontWeight: '600',
  },

  activeNav: {
    color: COLORS.gold,
  },
});

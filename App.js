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
  
// MANAGE MENU
if (screen === 'manage') {
  return (
    <SafeAreaView style={styles.container}>

      <Pressable onPress={() => setScreen('dashboard')}>
        <Text style={styles.back}>‹ BACK</Text>
      </Pressable>

      <Text style={styles.pageTitle}>MANAGE MENU</Text>
      <TextInput
        style={styles.input}
        placeholder="Search dishes..."
        placeholderTextColor="#777"
        value={searchText}
        onChangeText={setSearchText}
       />

      <ScrollView>

        {menuItems.length === 0 ? (

          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>YOUR MENU</Text>

            <Text style={styles.emptyText}>
              No dishes have been added yet.
            </Text>

            <Pressable
              style={styles.saveButton}
              onPress={() => setScreen('add')}
            >
              <Text style={styles.saveText}>
                ＋ ADD YOUR FIRST DISH
              </Text>
            </Pressable>
          </View>

        ) : (

          menuItems
           .filter(item =>
           item.name.toLowerCase().includes(searchText.toLowerCase())
         )
       .map(item => (

            <View style={styles.menuCard} key={item.id}>

              <Text style={styles.dishName}>
                {item.name}
              </Text>

              <Text style={styles.dishDescription}>
                {item.description}
              </Text>

              <Text style={styles.menuCourse}>
                {item.course}
              </Text>

              <Text style={styles.dishPrice}>
                {item.currency}{item.price}
              </Text>

   <Pressable
     style={styles.editButton}
      onPress={() => {
    setEditingDish(item);
    setDishName(item.name);
    setDescription(item.description);
    setCourse(item.course);
    setPrice(item.price);
    setCurrency(item.currency);
    setScreen('add');
  }}
>
  <Text style={styles.editText}>EDIT</Text>
</Pressable>
<Pressable
  style={styles.deleteButton}
  onPress={() => {
    setMenuItems(
      menuItems.filter(dish => dish.id !== item.id)
    );
  }}
>
  <Text style={styles.deleteText}>DELETE</Text>
</Pressable>
            </View>

          ))

        )}

      </ScrollView>

    </SafeAreaView>
  );
}
// VIEW MENU
if (screen === 'view') {
  return (
    <SafeAreaView style={styles.container}>

      <Pressable onPress={() => setScreen('dashboard')}>
        <Text style={styles.back}>‹ BACK</Text>
      </Pressable>

      <Text style={styles.pageTitle}>VIEW MENU</Text>

      <ScrollView>

        {/* STARTERS */}
        <Text style={styles.menuSection}>STARTERS</Text>

        {menuItems.filter(item => item.course === 'Starter').length === 0 ? (
          <View style={styles.menuCard}>
            <Text style={styles.emptyText}>
              No starters added yet.
            </Text>
          </View>
        ) : (
          menuItems
            .filter(item => item.course === 'Starter')
            .map(item => (
              <View style={styles.menuCard} key={item.id}>
                <Text style={styles.dishName}>{item.name}</Text>

                <Text style={styles.dishDescription}>
                  {item.description}
                </Text>

                <Text style={styles.dishPrice}>
                  {item.currency}{item.price}
                </Text>
              </View>
            ))
        )}

        {/* MAINS */}
        <Text style={styles.menuSection}>MAINS</Text>

        {menuItems.filter(item => item.course === 'Main').length === 0 ? (
          <View style={styles.menuCard}>
            <Text style={styles.emptyText}>
              No mains added yet.
            </Text>
          </View>
        ) : (
          menuItems
            .filter(item => item.course === 'Main')
            .map(item => (
              <View style={styles.menuCard} key={item.id}>
                <Text style={styles.dishName}>{item.name}</Text>

                <Text style={styles.dishDescription}>
                  {item.description}
                </Text>

                <Text style={styles.dishPrice}>
                  {item.currency}{item.price}
                </Text>
              </View>
            ))
        )}

        {/* DESSERTS */}
        <Text style={styles.menuSection}>DESSERTS</Text>

        {menuItems.filter(item => item.course === 'Dessert').length === 0 ? (
          <View style={styles.menuCard}>
            <Text style={styles.emptyText}>
              No desserts added yet.
            </Text>
          </View>
        ) : (
          menuItems
            .filter(item => item.course === 'Dessert')
            .map(item => (
              <View style={styles.menuCard} key={item.id}>
                <Text style={styles.dishName}>{item.name}</Text>

                <Text style={styles.dishDescription}>
                  {item.description}
                </Text>

                <Text style={styles.dishPrice}>
                  {item.currency}{item.price}
                </Text>
              </View>
            ))
        )}

      </ScrollView>

    </SafeAreaView>
  );
}
 // ADD DISH
if (screen === 'add') {
  return (
    <SafeAreaView style={styles.container}>

      <ScrollView>

        <Pressable onPress={() => setScreen('dashboard')}>
          <Text style={styles.back}>‹ BACK</Text>
        </Pressable>

        <Text style={styles.pageTitle}>ADD DISH</Text>

        <Text style={styles.label}>DISH NAME</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter dish name"
          placeholderTextColor="#777"
          value={dishName}
          onChangeText={setDishName}
        />

        <Text style={styles.label}>DESCRIPTION</Text>

        <TextInput
          style={[styles.input, styles.description]}
          placeholder="Describe your dish"
          placeholderTextColor="#777"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>COURSE</Text>

        <View style={styles.courseContainer}>

          <Pressable
            style={[
              styles.courseButton,
              course === 'Starter' && styles.selectedCourse
            ]}
            onPress={() => setCourse('Starter')}
          >
            <Text style={styles.courseText}>STARTER</Text>
          </Pressable>

          <Pressable
            style={[
              styles.courseButton,
              course === 'Main' && styles.selectedCourse
            ]}
            onPress={() => setCourse('Main')}
          >
            <Text style={styles.courseText}>MAIN</Text>
          </Pressable>

          <Pressable
            style={[
              styles.courseButton,
              course === 'Dessert' && styles.selectedCourse
            ]}
            onPress={() => setCourse('Dessert')}
          >
            <Text style={styles.courseText}>DESSERT</Text>
          </Pressable>

        </View>

        <Text style={styles.label}>PRICE</Text>

        <View style={styles.priceRow}>

          <Text style={styles.currency}>{currency}</Text>

          <TextInput
            style={styles.priceInput}
            placeholder="0.00"
            placeholderTextColor="#777"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />

        </View>

        <Text style={styles.label}>CURRENCY</Text>

        <View style={styles.currencyContainer}>

          <Pressable
            style={[
              styles.currencyButton,
              currency === 'R' && styles.selectedCourse
            ]}
            onPress={() => setCurrency('R')}
          >
            <Text style={styles.courseText}>RANDS</Text>
          </Pressable>

          <Pressable
            style={[
              styles.currencyButton,
              currency === '$' && styles.selectedCourse
            ]}
            onPress={() => setCurrency('$')}
          >
            <Text style={styles.courseText}>DOLLARS</Text>
          </Pressable>

          <Pressable
            style={[
              styles.currencyButton,
              currency === '£' && styles.selectedCourse
            ]}
            onPress={() => setCurrency('£')}
          >
            <Text style={styles.courseText}>POUNDS</Text>
          </Pressable>

        </View>

        <Pressable
          style={styles.saveButton}
          onPress={() => {

  if (!dishName || !description || !course || !price) {
    Alert.alert(
      'Missing Information',
      'Please complete all fields.'
    );
    return;
  }

  if (editingDish) {

    setMenuItems(
      menuItems.map(item =>
        item.id === editingDish.id
          ? {
              ...item,
              name: dishName,
              description: description,
              course: course,
              price: price,
              currency: currency,
            }
          : item
      )
    );

    Alert.alert(
      'Dish Updated',
      `${dishName} has been updated.`
    );

    setEditingDish(null);

  } else {

    const newDish = {
      id: Date.now().toString(),
      name: dishName,
      description: description,
      course: course,
      price: price,
      currency: currency,
    };

    setMenuItems([
      ...menuItems,
      newDish
    ]);

    Alert.alert(
      'Dish Added',
      `${dishName} has been added to your menu.`
    );
  }

}}
        >
          <Text style={styles.saveText}>
            ADD TO MENU
          </Text>
        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}

} // closes App()

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 35,
  },

  title: {
    color: '#D4B76A',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 5,
    marginTop: 15,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
  },

  statBox: {
    backgroundColor: '#151515',
    width: '31%',
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D4B76A',
  },

  number: {
    color: '#D4B76A',
    fontSize: 30,
    fontWeight: 'bold',
  },

  statText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 1,
  },

  buttons: {
    gap: 15,
  },

  button: {
    backgroundColor: '#D4B76A',
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#0B0B0B',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#151515',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D4B76A',
  },

  navText: {
    color: '#D4B76A',
    fontSize: 25,
  },

  back: {
    color: '#D4B76A',
    fontSize: 16,
    marginTop: 15,
  },

  pageTitle: {
    color: '#D4B76A',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 30,
    letterSpacing: 3,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },

  description: {
    height: 120,
    textAlignVertical: 'top',
  },

  courseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  courseButton: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 13,
    width: '31%',
    alignItems: 'center',
  },

  selectedCourse: {
    backgroundColor: '#D4B76A',
    borderColor: '#D4B76A',
  },

  courseText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currency: {
    color: '#D4B76A',
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 10,
  },

  priceInput: {
    flex: 1,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 18,
  },

  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  currencyButton: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 13,
    width: '31%',
    alignItems: 'center',
  },

  saveButton: {
    backgroundColor: '#D4B76A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 30,
  },

  saveText: {
    color: '#0B0B0B',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  editButton: {
  backgroundColor: '#D4B76A',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 15,
},

editText: {
  color: '#0B0B0B',
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 2,
},
deleteButton: {
  backgroundColor: '#2A2A2A',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 15,
},

deleteText: {
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 2,
},

emptyBox: {
  backgroundColor: '#151515',
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#D4B76A',
  padding: 25,
  marginTop: 20,
  alignItems: 'center',
},

emptyTitle: {
  color: '#D4B76A',
  fontSize: 20,
  fontWeight: 'bold',
  letterSpacing: 2,
},

emptyText: {
  color: '#FFFFFF',
  fontSize: 15,
  marginTop: 15,
  textAlign: 'center',
},

menuSection: {
  color: '#D4B76A',
  fontSize: 18,
  fontWeight: 'bold',
  letterSpacing: 2,
  marginTop: 25,
  marginBottom: 10,
},

menuCard: {
  backgroundColor: '#151515',
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#444',
  padding: 20,
  marginBottom: 10,
},

dishName: {
  color: '#D4B76A',
  fontSize: 18,
  fontWeight: 'bold',
},

dishDescription: {
  color: '#FFFFFF',
  fontSize: 14,
  marginTop: 8,
},

dishPrice: {
  color: '#D4B76A',
  fontSize: 16,
  fontWeight: 'bold',
  marginTop: 12,
},

});

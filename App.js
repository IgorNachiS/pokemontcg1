import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Button,
    ScrollView,
    Keyboard,
    Platform,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { useFonts } from 'expo-font';

const API_URL = 'https://api.pokemontcg.io/v2/cards';
const SETS_API_URL = 'https://api.pokemontcg.io/v2/sets';
const API_KEY = process.env.EXPO_PUBLIC_POKEMON_TCG_API_KEY;

const CARD_ITEM_HEIGHT = 130;

const COLORS = {
    background: '#1A1A1A',
    backgroundLight: '#2A2A2A',
    cardBackground: '#333333',
    border: '#4F4F4F',
    text: '#FFFFFF',
    textSecondary: '#DDDDDD',
    textMuted: '#BBBBBB',
    accentYellow: '#FFCB05',
    accentRed: '#FF0000',
    favoriteStar: '#FFCB05',
    illegalFormat: '#FF6B6B',
    placeholder: '#999999',
    loadingIndicator: '#AAAAAA',
};

const FONTS = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
};

const App = () => {
    const [fontsLoaded, fontError] = useFonts({
        'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    });

    const [pokemonName, setPokemonName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [deckName, setDeckName] = useState('');
    const [cardType, setCardType] = useState('');
    const [selectedSet, setSelectedSet] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('Standard');
    const [powerLevel, setPowerLevel] = useState(0);
    const [damageLevel, setDamageLevel] = useState(0);
    const [cards, setCards] = useState([]);
    const [sets, setSets] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const textInputRefs = {
        pokemonName: useRef(null),
        playerName: useRef(null),
        deckName: useRef(null),
        cardType: useRef(null),
    };
    const playerInputRef = useRef(null);
    const deckInputRef = useRef(null);
    const typeInputRef = useRef(null);

    useEffect(() => {
        fetchSets();
        loadFavorites();
    }, []);

    const fetchSets = async () => {
        try {
            const response = await fetch(SETS_API_URL, {
                headers: { 'X-Api-Key': API_KEY }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSets(data.data || []);
        } catch (error) {
            // Error handling removed as requested
        }
    };

    const fetchCards = async () => {
        Keyboard.dismiss();
        setIsLoading(true);
        setCards([]);
        try {
            let queryParts = [];
            if (pokemonName.trim()) queryParts.push(`name:"*${pokemonName.trim()}*"`);
            if (selectedSet) queryParts.push(`set.id:"${selectedSet}"`);
            if (cardType.trim()) queryParts.push(`types:"${cardType.trim()}"`);
            if (powerLevel > 0) queryParts.push(`hp:[${powerLevel} TO *]`);
            if (damageLevel > 0) queryParts.push(`attacks.damage:[${damageLevel} TO *]`);

            const finalQuery = queryParts.length > 0 ? `q=${encodeURIComponent(queryParts.join(' '))}` : '';
            let url = API_URL;
            if (finalQuery) {
                url += `?${finalQuery}&pageSize=50&orderBy=name`;
            } else {
                url += `?pageSize=50&orderBy=name`;
            }

            const response = await fetch(url, {
                headers: { 'X-Api-Key': API_KEY }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
            }

            const data = await response.json();
            setCards(data.data || []);
        } catch (error) {
             // Error handling removed as requested
        } finally {
            setIsLoading(false);
        }
    };

    const clearFields = () => {
        setPokemonName('');
        setPlayerName('');
        setDeckName('');
        setCardType('');
        setSelectedSet('');
        setPowerLevel(0);
        setDamageLevel(0);
        setSelectedFormat('Standard');
        setCards([]);
        Object.values(textInputRefs).forEach(ref => ref.current?.clear());
        Keyboard.dismiss();
    };

    const toggleFavorite = async (card) => {
        let updatedFavorites;
        const isFavorite = favorites.some((fav) => fav.id === card.id);
        if (isFavorite) {
            updatedFavorites = favorites.filter(fav => fav.id !== card.id);
        } else {
            updatedFavorites = [...favorites, card];
        }
        setFavorites(updatedFavorites);
        try {
            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        } catch (error) {
             // Error handling removed as requested
        }
    };

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
             // Error handling removed as requested
        }
    };

    const renderForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.title}>Pokémon TCG Guide</Text>

            <TextInput
                ref={textInputRefs.pokemonName}
                style={styles.input}
                placeholder="Pokémon Name"
                placeholderTextColor={COLORS.placeholder}
                value={pokemonName}
                onChangeText={setPokemonName}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => playerInputRef.current?.focus()}
            />
            <TextInput
                ref={playerInputRef}
                style={styles.input}
                placeholder="Player Name (Optional)"
                placeholderTextColor={COLORS.placeholder}
                value={playerName}
                onChangeText={setPlayerName}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => deckInputRef.current?.focus()}
            />
            <TextInput
                ref={deckInputRef}
                style={styles.input}
                placeholder="Deck Name (Optional)"
                placeholderTextColor={COLORS.placeholder}
                value={deckName}
                onChangeText={setDeckName}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => typeInputRef.current?.focus()}
            />
            <TextInput
                ref={typeInputRef}
                style={styles.input}
                placeholder="Card Type (e.g., Fire, Water)"
                placeholderTextColor={COLORS.placeholder}
                value={cardType}
                onChangeText={setCardType}
                onSubmitEditing={fetchCards}
                returnKeyType="search"
                blurOnSubmit={true}
            />

            <Text style={styles.label}>Set:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedSet}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedSet(itemValue)}
                    dropdownIconColor={COLORS.text}
                >
                    <Picker.Item label="Any Set" value="" />
                    {sets.sort((a, b) => a.name.localeCompare(b.name)).map((set) => (
                        <Picker.Item key={set.id} label={set.name} value={set.id} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Format:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedFormat}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedFormat(itemValue)}
                    dropdownIconColor={COLORS.text}
                >
                    <Picker.Item label="Standard" value="Standard" />
                    <Picker.Item label="Expanded" value="Expanded" />
                    <Picker.Item label="Unlimited" value="Unlimited" />
                </Picker>
            </View>

            <Text style={styles.label}>Min HP: {powerLevel}</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={350}
                step={10}
                value={powerLevel}
                minimumTrackTintColor={COLORS.accentRed}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.accentRed}
                onValueChange={(value) => setPowerLevel(Math.round(value))}
            />

            <Text style={styles.label}>Min Damage: {damageLevel}</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={350}
                step={10}
                value={damageLevel}
                minimumTrackTintColor={COLORS.accentYellow}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.accentYellow}
                onValueChange={(value) => setDamageLevel(Math.round(value))}
            />

            <View style={styles.buttonRow}>
                <Button title="Search Cards" onPress={fetchCards} color={COLORS.accentYellow} disabled={isLoading} />
                <Button title="Clear Filters" onPress={clearFields} color={COLORS.textMuted} disabled={isLoading} />
            </View>
        </View>
    );

    const getItemLayout = (data, index) => ({
        length: CARD_ITEM_HEIGHT,
        offset: CARD_ITEM_HEIGHT * index,
        index
    });

    if (!fontsLoaded && !fontError) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accentYellow} />
                </View>
            </SafeAreaView>
        );
    }

     if (fontError) {
        return (
             <SafeAreaView style={styles.safeArea}>
                 <View style={styles.loadingContainer}>
                     <Text style={styles.errorText}>Error loading fonts.</Text>
                 </View>
             </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                style={styles.listContainer}
                data={cards}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        {renderForm()}
                        <Text style={styles.resultsTitle}>Results:</Text>
                    </>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            setSelectedCard(item);
                            setModalVisible(true);
                        }}
                        style={styles.cardOuterContainer}
                    >
                        <View style={styles.cardContainer}>
                            <Image
                                source={{ uri: item.images.small }}
                                style={styles.cardImage}
                                resizeMode="contain"
                                defaultSource={{ uri: 'placeholder_image_uri' }}
                            />
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                                <Text style={styles.cardSet} numberOfLines={1} ellipsizeMode="tail">{item.set?.name || 'N/A'}</Text>
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(item);
                                    }}
                                    style={styles.favoriteButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={styles.favoriteButtonText}>
                                        {favorites.some(fav => fav.id === item.id) ? '★ Favorited' : '☆ Favorite'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                getItemLayout={getItemLayout}
                ListEmptyComponent={() => (
                    isLoading
                        ? <Text style={styles.loadingText}>Loading...</Text>
                        : (pokemonName || selectedSet || cardType || powerLevel > 0 || damageLevel > 0) && cards.length === 0 && !isLoading
                            ? <Text style={styles.noResultsText}>No cards found matching your criteria.</Text>
                            : <Text style={styles.noResultsText}>Enter criteria in the form above and search.</Text>
                )}
                contentContainerStyle={styles.listContentContainer}
                keyboardShouldPersistTaps="handled"
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
                transparent={false}
            >
                <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                    <SafeAreaView style={styles.modalSafeArea}>
                        <View style={styles.modalContainer}>
                            {selectedCard && (
                                <>
                                    <Text style={styles.modalTitle}>{selectedCard.name}</Text>
                                    <Image
                                        source={{ uri: selectedCard.images.large }}
                                        style={styles.modalImage}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.detailSection}>
                                         <Text style={styles.modalSubTitle}>Details</Text>
                                         <Text style={styles.modalText}>Set: {selectedCard.set?.name || 'N/A'} ({selectedCard.set?.series || 'N/A'})</Text>
                                         <Text style={styles.modalText}>Type: {selectedCard.supertype || 'N/A'} {selectedCard.subtypes ? `(${selectedCard.subtypes.join(', ')})` : ''}</Text>
                                         <Text style={styles.modalText}>HP: {selectedCard.hp || 'N/A'}</Text>
                                         <Text style={styles.modalText}>Rarity: {selectedCard.rarity || 'N/A'}</Text>
                                         <Text style={styles.modalText}>Number: {selectedCard.number} / {selectedCard.set?.printedTotal || '?'}</Text>
                                         {selectedCard.flavorText && <Text style={[styles.modalText, styles.flavorText]}>"{selectedCard.flavorText}"</Text>}
                                    </View>

                                    {selectedCard.attacks && selectedCard.attacks.length > 0 && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.modalSubTitle}>Attacks:</Text>
                                            {selectedCard.attacks.map((attack, index) => (
                                                <View key={index} style={styles.attackContainer}>
                                                    <Text style={styles.modalTextBold}>{attack.name}</Text>
                                                    {attack.cost && <Text style={styles.modalText}>Cost: {attack.cost.join(', ')}</Text>}
                                                    {attack.damage && <Text style={styles.modalText}>Damage: {attack.damage}</Text>}
                                                    {attack.text && <Text style={styles.modalText}>Effect: {attack.text}</Text>}
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={styles.detailSection}>
                                         <Text style={styles.modalSubTitle}>Combat Info</Text>
                                         <Text style={styles.modalText}>Weakness: {selectedCard.weaknesses?.map(w => `${w.type} ${w.value}`).join(', ') || 'N/A'}</Text>
                                         <Text style={styles.modalText}>Resistance: {selectedCard.resistances?.map(r => `${r.type} ${r.value}`).join(', ') || 'N/A'}</Text>
                                         <Text style={styles.modalText}>Retreat Cost: {selectedCard.retreatCost?.join(', ') || '0'}</Text>
                                    </View>

                                    {selectedCard.tcgplayer?.prices && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.modalSubTitle}>Market Prices (TCGplayer):</Text>
                                            <Text style={styles.modalText}>Market (Holo/Normal): ${selectedCard.tcgplayer.prices?.holofoil?.market || selectedCard.tcgplayer.prices?.normal?.market || 'N/A'}</Text>
                                            <Text style={styles.modalText}>Low (Holo/Normal): ${selectedCard.tcgplayer.prices?.holofoil?.low || selectedCard.tcgplayer.prices?.normal?.low || 'N/A'}</Text>
                                            {selectedCard.tcgplayer.updatedAt && <Text style={[styles.modalText, styles.priceUpdateText]}>Updated: {selectedCard.tcgplayer.updatedAt}</Text>}
                                        </View>
                                    )}

                                    {selectedCard.legalities && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.modalSubTitle}>Legalities:</Text>
                                            {Object.entries(selectedCard.legalities).map(([format, status]) => (
                                                <Text key={format} style={[styles.modalText, status !== 'Legal' && styles.illegalFormat]}>
                                                    {format}: {status || 'N/A'}
                                                </Text>
                                            ))}
                                        </View>
                                    )}

                                    <View style={styles.modalButtonContainer}>
                                        <Button
                                            title="Close"
                                            onPress={() => setModalVisible(false)}
                                            color={COLORS.accentYellow}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
     errorText: {
        fontSize: 16,
        color: COLORS.accentRed,
        fontFamily: 'System',
    },
    formContainer: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    resultsTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.accentYellow,
        marginTop: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: COLORS.accentYellow,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        color: COLORS.text,
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: COLORS.cardBackground,
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: COLORS.cardBackground,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
        color: COLORS.text,
        ...(Platform.OS === 'android' && { backgroundColor: COLORS.cardBackground }),
        ...(Platform.OS === 'ios' && { height: 200 }),
    },
    slider: {
        width: '100%',
        height: 40,
        marginBottom: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    listContainer: {
        flex: 1,
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    cardOuterContainer: {
        height: CARD_ITEM_HEIGHT,
        justifyContent: 'center',
        marginBottom: 10,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
        flex: 1,
    },
    cardImage: {
        width: 70,
        height: 100,
        borderRadius: 6,
        marginRight: 15,
        backgroundColor: COLORS.border,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardName: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
    },
    cardSet: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginBottom: 8,
    },
    favoriteButton: {
        backgroundColor: COLORS.border,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 'auto',
    },
    favoriteButtonText: {
        color: COLORS.favoriteStar,
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    loadingText: {
        color: COLORS.loadingIndicator,
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        fontFamily: FONTS.regular,
        paddingHorizontal: 15,
    },
    noResultsText: {
        color: COLORS.loadingIndicator,
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        fontFamily: FONTS.regular,
        paddingHorizontal: 15,
    },
    modalScrollContainer: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
    },
     modalSafeArea: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 26,
        fontFamily: FONTS.bold,
        color: COLORS.accentYellow,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalImage: {
        width: '90%',
        aspectRatio: 680 / 950,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.border,
    },
    modalText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'left',
        width: '100%',
    },
     modalTextBold: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        color: COLORS.text,
        marginBottom: 4,
        textAlign: 'left',
        width: '100%',
    },
    modalSubTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.accentYellow,
        marginTop: 10,
        marginBottom: 8,
        width: '100%',
        textAlign: 'left',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 4,
    },
    detailSection: {
        marginVertical: 10,
        width: '100%',
        paddingHorizontal: 15,
        backgroundColor: COLORS.backgroundLight,
        borderRadius: 8,
        paddingVertical: 12,
    },
    attackContainer: {
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    flavorText: {
        fontStyle: 'italic',
        color: COLORS.textMuted,
        fontFamily: FONTS.regular,
        marginTop: 5,
    },
    illegalFormat: {
        color: COLORS.illegalFormat,
    },
    priceUpdateText: {
         fontSize: 12,
         color: COLORS.textMuted,
         fontFamily: FONTS.regular,
         marginTop: 5,
    },
    modalButtonContainer: {
        marginTop: 30,
        marginBottom: 20,
        width: '60%',
        alignSelf: 'center',
    }
});

export default App;

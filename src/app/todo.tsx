import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// ==========================================
// TIPE DATA & KONSTANTA API
// ==========================================
interface TodoItem {
    id: number;
    title: string;
    completed: boolean;
    course?: string;
    userId?: number;
}

const API_BASE_URL = "https://jsonplaceholder.typicode.com";
const COURSE_NAMES = [
    "Pemrograman Mobile",
    "Struktur Data & Algoritma",
    "Basis Data Terdistribusi",
    "Jaringan Komputer",
    "Kecerdasan Buatan & ML",
    "Rekayasa Perangkat Lunak",
];

// ==========================================
// KOMPONEN IKON SVG
// ==========================================
function ArrowLeftIcon({
    size = 20,
    color = "#FFFFFF",
}: {
    size?: number;
    color?: string;
}) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke={color}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function RefreshIcon({
    size = 20,
    color = "#FFFFFF",
}: {
    size?: number;
    color?: string;
}) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M21 12A9 9 0 1 1 18.36 5.64L21 8M21 3V8H16"
                stroke={color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function CheckmarkIcon({
    size = 15,
    color = "#10B981",
}: {
    size?: number;
    color?: string;
}) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M20 6L9 17L4 12"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function TrashIcon({
    size = 18,
    color = "#0D9488",
}: {
    size?: number;
    color?: string;
}) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M3 6H5H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6M10 11V17M14 11V17"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

// ==========================================
// HALAMAN UTAMA TODO LIST ASYNC (WEEK 8)
// ==========================================
export default function TodoListScreen() {
    const router = useRouter();

    // State Utama
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // ----------------------------------------------------
    // FITUR 01 & 02: TAMPILKAN DATA API (GET) & LOADING
    // ----------------------------------------------------
    const fetchTodos = useCallback(async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // JSONPlaceholder supplies task IDs; displayed titles come from the course list.
            const response = await fetch(`${API_BASE_URL}/todos?_limit=${COURSE_NAMES.length}`);
            if (!response.ok) {
                throw new Error(`Server API status: ${response.status}`);
            }

            const data: TodoItem[] = await response.json();
            setTodos(
                data.map((item, index) => ({
                    ...item,
                    title: COURSE_NAMES[index] ?? "Mata Kuliah",
                    course: COURSE_NAMES[index],
                    completed: false,
                })),
            );
        } catch (error: any) {
            // FITUR 05: ERROR HANDLING DENGAN TRY/CATCH & ALERT
            Alert.alert(
                "Gagal Memuat Data API",
                error?.message ||
                    "Tidak dapat terhubung ke JSONPlaceholder server. Silakan coba kembali.",
                [{ text: "Oke" }],
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Load initial tasks so the screen can show its loading indicator.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTodos();
    }, [fetchTodos]);

    // ----------------------------------------------------
    // FITUR 03: MENAMBAHKAN TODO (POST)
    // Input teks -> Kirim POST ke API -> Masuk ke daftar
    // ----------------------------------------------------
    const handleAddTodo = async () => {
        const trimmedTitle = inputText.trim();
        if (!trimmedTitle) {
            Alert.alert(
                "Perhatian",
                "Ketikkan judul tugas baru terlebih dahulu.",
            );
            return;
        }

        const course = COURSE_NAMES.find(
            (name) => name.toLocaleLowerCase("id-ID") === trimmedTitle.toLocaleLowerCase("id-ID"),
        );
        if (!course) {
            Alert.alert(
                "Mata Kuliah Tidak Ditemukan",
                `Pilih salah satu mata kuliah berikut: ${COURSE_NAMES.join(", ")}.`,
            );
            return;
        }

        try {
            setIsSubmitting(true);
            Keyboard.dismiss();

            // Kirim request POST ke https://jsonplaceholder.typicode.com/todos
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    completed: false,
                    userId: 1,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Gagal menyimpan ke server: status ${response.status}`,
                );
            }

            const createdResponse = await response.json();

            // Tambahkan item baru langsung ke bagian teratas daftar
            const newItem: TodoItem = {
                id: createdResponse.id || Date.now(),
                title: course,
                completed: false,
                course,
                userId: 1,
            };

            setTodos((prev) => [newItem, ...prev]);
            setInputText("");
        } catch (error: any) {
            Alert.alert(
                "Gagal Menambah Tugas",
                error?.message || "Terjadi kesalahan jaringan saat POST data.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------
    // FITUR 04: UBAH STATUS TUGAS (CENTANG / TOGGLE DENGAN PATCH)
    // Klik centang -> status berubah -> kirim PATCH ke server
    // ----------------------------------------------------
    const handleToggleTodo = async (todo: TodoItem) => {
        const nextStatus = !todo.completed;

        // 1. Langsung update status di layar (Centang/Uncentang instan)
        setTodos((prev) =>
            prev.map((item) =>
                item.id === todo.id ? { ...item, completed: nextStatus } : item,
            ),
        );

        if (nextStatus) {
            router.push({
                pathname: "/unggah",
                params: {
                    mataKuliah: todo.course ?? todo.title,
                    returnToTodo: "true",
                },
            });
        }

        // 2. Kirim update ke server API via PATCH
        try {
            // Catatan Penugasan: PATCH /todos/1 (simulasi update status selesai)
            const targetId = todo.id <= 200 ? todo.id : 1;
            const response = await fetch(`${API_BASE_URL}/todos/${targetId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    completed: nextStatus,
                }),
            });
            if (!response.ok) {
                throw new Error(`Server API status: ${response.status}`);
            }
        } catch {
            if (!nextStatus) {
                setTodos((prev) =>
                    prev.map((item) =>
                        item.id === todo.id
                            ? { ...item, completed: todo.completed }
                            : item,
                    ),
                );
            }
            Alert.alert(
                "Status Tugas",
                nextStatus
                    ? "Tugas tetap dibuka untuk diunggah, tetapi status server gagal diperbarui."
                    : "Gagal memperbarui status ke server API.",
            );
        }

    };

    // ----------------------------------------------------
    // FITUR HAPUS TUGAS (DELETE LANGSUNG)
    // Klik icon tempat sampah -> tugas terhapus langsung dari daftar
    // ----------------------------------------------------
    const handleDeleteTodo = async (todoId: number) => {
        // 1. Langsung hapus dari daftar di layar
        setTodos((prev) => prev.filter((item) => item.id !== todoId));

        // 2. Kirim request DELETE ke server API di background
        try {
            const targetId = todoId <= 200 ? todoId : 1;
            await fetch(`${API_BASE_URL}/todos/${targetId}`, {
                method: "DELETE",
            });
        } catch {
            // Mock API tidak memblokir hapus lokal
        }
    };

    return (
        <View style={styles.outerContainer}>
            <View style={styles.screenWrapper}>
                <SafeAreaView
                    style={styles.safeArea}
                    edges={["top", "left", "right"]}
                >
                    {/* ==========================================
              HEADER PERSIS TARGET UI MOBILE
          ========================================== */}
                    <View style={styles.header}>
                        <Pressable
                            style={styles.headerBackBtn}
                            onPress={() => router.replace("/dashboard")}
                            accessibilityLabel="Kembali ke Dashboard"
                        >
                            <ArrowLeftIcon size={20} color="#FFFFFF" />
                        </Pressable>

                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>
                                Todo List App
                            </Text>
                        </View>

                        {/* FITUR 06: REFRESH DATA (TOMBOL RELOAD) */}
                        <Pressable
                            style={styles.headerReloadBtn}
                            onPress={() => fetchTodos(true)}
                            disabled={refreshing || loading}
                            accessibilityLabel="Reload Data API"
                        >
                            {refreshing ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <RefreshIcon size={20} color="#FFFFFF" />
                            )}
                        </Pressable>
                    </View>

                    {/* ==========================================
              KONTEN SESUAI TAB
          ========================================== */}
                    <View style={styles.contentBody}>
                            {/* FITUR 03: FORM INPUT TEKS & TOMBOL + TAMBAH */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Nama mata kuliah..."
                                    placeholderTextColor="#94A3B8"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    onSubmitEditing={handleAddTodo}
                                    returnKeyType="done"
                                />
                                <Pressable
                                    style={[
                                        styles.addButton,
                                        isSubmitting &&
                                            styles.addButtonDisabled,
                                    ]}
                                    onPress={handleAddTodo}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <Text style={styles.addButtonText}>
                                            + Tambah
                                        </Text>
                                    )}
                                </Pressable>
                            </View>

                            {/* FITUR 02: LOADING INDICATOR */}
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator
                                        size="large"
                                        color="#0284C7"
                                    />
                                    <Text style={styles.loadingText}>
                                        Memuat data dari server...
                                    </Text>
                                </View>
                            ) : (
                                <ScrollView
                                    style={styles.scrollList}
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={() => fetchTodos(true)}
                                            colors={["#0284C7", "#F97316"]}
                                        />
                                    }
                                >
                                    {todos.length === 0 ? (
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyTitle}>
                                                Belum Ada Tugas
                                            </Text>
                                            <Text style={styles.emptyDesc}>
                                                Ketik tugas baru di atas atau
                                                tekan tombol refresh.
                                            </Text>
                                        </View>
                                    ) : (
                                        todos.map((todo) => {
                                            return (
                                                <View
                                                    key={todo.id}
                                                    style={[
                                                        styles.todoCard,
                                                        todo.completed &&
                                                            styles.todoCardCompleted,
                                                    ]}
                                                >
                                                    {/* FITUR 04: CENTANG TUGAS (TOGGLE PATCH) */}
                                                    <Pressable
                                                        style={
                                                            styles.todoCheckArea
                                                        }
                                                        onPress={() =>
                                                            handleToggleTodo(
                                                                todo,
                                                            )
                                                        }
                                                    >
                                                        <View
                                                            style={[
                                                                styles.checkbox,
                                                                todo.completed &&
                                                                    styles.checkboxChecked,
                                                            ]}
                                                        >
                                                            {todo.completed && (
                                                                <CheckmarkIcon
                                                                    size={14}
                                                                    color="#10B981"
                                                                />
                                                            )}
                                                        </View>

                                                        <Text
                                                            style={[
                                                                styles.todoTitle,
                                                                todo.completed &&
                                                                    styles.todoTitleCompleted,
                                                            ]}
                                                            numberOfLines={2}
                                                        >
                                                            {todo.title}
                                                        </Text>
                                                    </Pressable>

                                                    {/* HAPUS TUGAS (TEMPAT SAMPAH) */}
                                                    <Pressable
                                                        style={styles.deleteBtn}
                                                        onPress={() =>
                                                            handleDeleteTodo(
                                                                todo.id,
                                                            )
                                                        }
                                                        hitSlop={8}
                                                        accessibilityLabel="Hapus tugas"
                                                    >
                                                        <TrashIcon
                                                            size={18}
                                                            color="#0D9488"
                                                        />
                                                    </Pressable>
                                                </View>
                                            );
                                        })
                                    )}
                                </ScrollView>
                            )}
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}

// ==========================================
// STYLING DETAIL (SESUAI TARGET UI MOBILE)
// ==========================================
const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: "#0F172A",
        alignItems: "center",
        justifyContent: "center",
    },
    screenWrapper: {
        width: "100%",
        maxWidth: 480,
        flex: 1,
        backgroundColor: "#F8FAFC",
        ...Platform.select({
            web: {
                height: "100vh" as any,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            },
        }),
    },
    safeArea: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },

    // Header Biru Dongker
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0F2850",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerBackBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    headerTitleContainer: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    headerReloadBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.12)",
    },

    // Body
    contentBody: {
        flex: 1,
    },

    // Input & Tombol Tambah
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    textInput: {
        flex: 1,
        height: 44,
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 14,
        color: "#0F172A",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    addButton: {
        backgroundColor: "#F97316",
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonDisabled: {
        opacity: 0.7,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    loadingText: {
        marginTop: 14,
        fontSize: 14,
        color: "#64748B",
    },

    // List
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 24,
    },

    // Todo Card
    todoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    todoCardCompleted: {
        backgroundColor: "#F8FAFC",
        opacity: 0.8,
    },
    todoCheckArea: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 1.8,
        borderColor: "#10B981",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        backgroundColor: "#FFFFFF",
    },
    checkboxChecked: {
        backgroundColor: "#ECFDF5",
        borderColor: "#10B981",
    },
    todoTitle: {
        flex: 1,
        fontSize: 14,
        color: "#1E293B",
        lineHeight: 20,
    },
    todoTitleCompleted: {
        color: "#94A3B8",
        textDecorationLine: "line-through",
    },
    deleteBtn: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: "#F0FDFA",
        borderWidth: 1,
        borderColor: "#CCFBF1",
        marginLeft: 8,
    },

    // Empty State
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 6,
    },
    emptyDesc: {
        fontSize: 13,
        color: "#94A3B8",
        textAlign: "center",
    },

});

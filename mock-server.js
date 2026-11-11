const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3001;
const SECRET_KEY = "simak-secret-key-week5";

app.use(cors());
app.use(express.json());

// Middleware Pengecekan JWT (Bearer Token)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak ditemukan!" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token tidak valid atau telah kedaluwarsa!" });
    }
    req.user = user;
    next();
  });
};

// 1. Endpoint Login (Public)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Mock validasi user
  if (email && password) {
    const user = { email: email, role: "student" };
    const access_token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login berhasil!",
      access_token: access_token,
      user: user,
    });
  }

  return res.status(400).json({ message: "Email dan password wajib diisi!" });
});

// 2. Endpoint Logout (Protected)
app.post("/logout", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Logout berhasil, token dibatalkan!" });
});

// 3. Endpoint Register (Public)
app.post("/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  res
    .status(201)
    .json({ message: "Registrasi berhasil!", user: { name, email } });
});

// 4. Endpoint Programs (Protected)
app.get("/programs", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Berhasil mengambil data program",
    data: [
      { id: 1, title: "Program Magang Industri 2026", status: "Aktif" },
      { id: 2, title: "Pertukaran Pelajar Internasional", status: "Segera" },
    ],
  });
});

// 5. Endpoint News (Protected)
app.get("/news", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Berhasil mengambil data berita",
    data: [
      {
        id: 1,
        title: "Pengumuman Akademik Semester Ganjil",
        date: "2026-10-14",
      },
      { id: 2, title: "Jadwal Pengisian KRS Online", date: "2026-10-15" },
    ],
  });
});

// Jalankan Server & Cetak Log Endpoint persis seperti tampilan dosen
app.listen(PORT, () => {
  console.log(`\n• POST http://localhost:${PORT}/login`);
  console.log(`• POST http://localhost:${PORT}/logout`);
  console.log(`• POST http://localhost:${PORT}/auth/register`);
  console.log(`• GET http://localhost:${PORT}/programs (Protected)`);
  console.log(`• GET http://localhost:${PORT}/news (Protected)\n`);
});

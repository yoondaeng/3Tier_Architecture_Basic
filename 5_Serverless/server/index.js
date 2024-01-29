const OpenAI = require("openai");
const express = require("express");
const serverless = require("serverless-http");
const mysql = require("mysql");
const dotenv = require("dotenv");
// CORS 정책 설정은 Lambda 설정에서 해야하므로 express 미들웨어에서 제외해야 함
// const cors = require("cors");

dotenv.config();
const app = express();
// CORS 정책 설정은 Lambda 설정에서 해야하므로 express 미들웨어에서 제외해야 함
// app.use(cors());
app.use(express.json());

const { DB_HOST, DB_USER, DB_PW, DB_NAME, OPENAI_API_KEY } = process.env;
console.log(">>>>>>>>>>>>> ", DB_HOST, DB_USER, DB_PW, DB_NAME);

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PW,
  database: DB_NAME,
});

// 데이터베이스 연결
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("데이터베이스 연결 완료");
  const createTableQuery = `CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_note TEXT,
        ai_note TEXT
    )`;
  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Notes 데이터베이스에 Notes 테이블 생성");
  });
});

// OPENAI 클라이언트 생성
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.json({ message: "서버 연결 완료" });
});

// AI 조언 추가 버튼 작동
app.post("/ainotes", async (req, res) => {
  const { usernote, noteId } = req.body.content;
  console.log(`입력받은 내용 : ${usernote}`);

  // OpenAI API 호출
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Your are expert in AWS, Tell me one AWS service names that I can learn additionally based on the data sent by the user. Reply in Korean",
      },
      { role: "user", content: usernote },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
  });

  const gptResponse = completion.choices[0].message.content;
  console.log("GPT 응답: ", gptResponse);

  const sql = "UPDATE notes SET ai_note = ? WHERE id = ?";
  const values = [gptResponse, noteId];
  await new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  }).then(() => {
    res.json({
      message: "AI advice created",
      noteId: noteId,
    });
  });
});

// 메모 추가 요청 처리
app.post("/notes", (req, res) => {
  const userMessage = req.body.content;
  console.log(`입력받은 내용 : ${userMessage}`);

  // 데이터베이스에 사용자 메모 저장
  const sql = "INSERT INTO notes (user_note) VALUES (?)";
  const values = [userMessage];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("데이터베이스 저장 오류:", err);
      return res.status(500).json({ error: "데이터베이스 오류" });
    }
    const addedId = result.insertId;
    console.log("사용자 메모 데이터베이스에 저장 완료");
    res.json({
      message: "메모가 저장되었습니다",
      note: { id: addedId, user_note: userMessage },
    });
  });
});

// 전체 메모 불러오기
app.get("/notes", (req, res) => {
  const sql = "SELECT * FROM notes";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// 특정 메모 삭제
app.delete("/notes/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM notes WHERE id = ?";
  db.query(sql, id, (err, result) => {
    if (err) throw err;
    res.send(`Note with id ${id} deleted`);
  });
  // delete marker 로직을 추가하기 어려움
  // db 생성시 scheme를 정했기 때문에 수정이 쉽지 않음
});

// 전체 메모 삭제
app.delete("/notes", (req, res) => {
  const sql = "DELETE FROM notes";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send("All notes deleted");
  });
});

module.exports.handler = serverless(app);

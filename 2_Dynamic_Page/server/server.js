const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let newId = 2;
// 메모 데이터를 저장할 배열
let dbnotes = [
  { id: 0, user_note: "경기과학기술대학교 빅데이터 AWS 해커톤" },
  { id: 1, user_note: "S3로 Static Page를 만들어 봅시다." },
];

app.get("/", (req, res) => {
  res.json({ message: "서버 연결 완료" });
});

// 메모 추가 요청 처리
app.post("/notes", (req, res) => {
  const userMessage = req.body.content;

  // 새 메모 객체 생성
  const newNote = {
    id: newId, // 단순하게 id 생성 (권장 방식 X)
    user_note: userMessage,
  };
  newId = newId + 1;

  // 메모 배열에 메모 추가
  dbnotes.push(newNote);
  res.json({ message: "메모가 저장되었습니다", note: newNote });
});

// 전체 메모 불러오기
app.get("/notes", (req, res) => {
  res.json(dbnotes);

  // 개선된 delete 코드와 함께 사용
  // activeNotes = dbnotes.filter((note) => note.deleted !== true);
  // res.json(activeNotes);
});

// 특정 메모 삭제
app.delete("/notes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  dbnotes = dbnotes.filter((note) => note.id !== id);
  res.send(`Note with id ${id} deleted`);

  // delete 로직 개선
  // 데이터 삭제는 실제로 데이터를 삭제하지 않음
  // delete marker를 추가하고 별도 관리
  // dbnotes = dbnotes.map((note) => {
  //   // 삭제 대상이 아닌 노트는 그대로
  //   if (note.id !== id) return note;
  //   // 삭제 대상 노트만 delete marker 추가
  //   return {
  //     ...note,
  //     deleted: true,
  //   };
  // });
  // res.send(`Note with id ${id} deleted`);
});

// 전체 메모 삭제
app.delete("/notes", (req, res) => {
  dbnotes = []; // 메모 배열 초기화
  res.send("All notes deleted");

  // 개선 delete 코드와 함께 사용
  // dbnotes = dbnotes.map((note) => {
  //   return {
  //     ...note,
  //     delete: true,
  //   };
  // });
  // res.send("All notes deleted");
});

const port = 80;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

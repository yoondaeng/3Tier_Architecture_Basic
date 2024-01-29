import React, { useState, useEffect } from "react";
import "./App.css";

let id = 2;
let dbnotes = [
  { id: 0, user_note: "경기과학기술대학교 빅데이터 AWS 해커톤" },
  { id: 1, user_note: "S3로 Static Page를 만들어 봅시다." },
];
function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  // 브라우저가 렌더링(접속 또는 새로고침)될때마다 실행
  const fetchNotes = () => {
    fetch(`${process.env.REACT_APP_API_URL}/notes`)
      .then((response) => response.json())
      .then((data) => setNotes(data));
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote) return;

    console.log("[addNote] add ONE note");
    id = id + 1;
    dbnotes.push({ id: id, user_note: newNote });
    setNotes(dbnotes);
    setNewNote("");
  };

  const deleteNote = (id) => {
    console.log("[deleteNote] delete ONE note");
    dbnotes = dbnotes.filter((note) => note.id !== id);
    setNotes(dbnotes);
  };

  const deleteNotes = () => {
    console.log("[deleteNotes] delete ALL notes");
    dbnotes = [];
    setNotes(dbnotes);
  };

  return (
    <div className="App">
      <h1>학습 기록 애플리케이션</h1>
      <h3>오늘 학습한 내용을 기록해보세요.</h3>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="무엇을 공부하셨나요?"
      />
      <br />
      <button onClick={addNote}>학습 기록 추가</button>
      <button onClick={deleteNotes}>전체 기록 삭제</button>

      <h2>내 학습 기록</h2>
      <div>
        {notes.map((note) => (
          <div key={note.id} className="note">
            <button onClick={() => deleteNote(note.id)}>삭제</button>
            <div>
              <strong>사용자 메모:</strong> {note.user_note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

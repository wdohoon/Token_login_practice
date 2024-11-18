const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:63342",
      "http://localhost:63342",
    ],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const secretKey = "ozcodingschool";

// 클라이언트에서 post 요청을 받은 경우
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;
  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword
  );
  // 유저정보가 없는 경우
  if (!userInfo) {
    res.status(401).send("로그인 실패");
  } else {
    // 1. 유저정보가 있는 경우 accessToken을 발급하는 로직을 작성하세요.(sign)
    const accessToken = jwt.sign(
      {
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
      },
      secretKey,
      { expiresIn: "1h" } // 토큰 유효기간 설정
    );
    // 2. 응답으로 accessToken을 클라이언트로 전송하세요. (res.send 사용)
    res.send(accessToken);
  }
});

// 클라이언트에서 get 요청을 받은 경우
app.get("/", (req, res) => {
  // 3. req headers에 담겨있는 accessToken을 검증하는 로직을 작성하세요.(verify)
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).send("토큰이 없습니다.");
  }

  const token = authHeader.split(" ")[1]; // Bearer 토큰 형식에서 실제 토큰 값 추출
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("유효하지 않은 토큰입니다.");
    }
    // 4. 검증이 완료되면 유저정보를 클라이언트로 전송하세요.(res.send 사용)
    const userInfo = users.find((el) => el.user_id === decoded.user_id);
    if (!userInfo) {
      return res.status(404).send("유저 정보를 찾을 수 없습니다.");
    }
    res.send(userInfo);
  });
});

app.listen(3000, () => console.log("서버 실행!"));

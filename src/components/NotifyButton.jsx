


import React, { useState } from "react";
import axios from "axios";

function NotifyButton() {
  const [pos, setPos] = useState({ lat: null, lon: null });
  const serverUrl =
    "https://tpryuhul18.execute-api.us-east-1.amazonaws.com/jeju-cloud-03-markerCreateHandler";

  const sendFileToS3 = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setPos(newPos);
        console.log("현재 위치:", newPos);

        // 예: 100000~100100 사이의 난수에 .jpg를 붙임
        const fileName = `${100000 + Math.round(Math.random() * 100)}.jpg`;
        const imagePath = `${process.env.PUBLIC_URL}/data/image/${fileName}`;

        try {
          // 이미지 파일 가져오기
          const response = await fetch(imagePath);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const blob = await response.blob();
          console.log("Blob size:", blob.size);

          // Lambda로 POST 요청 (JSON)
          const presignedUrlResponse = await axios.post(serverUrl, {
            latitude: newPos.lat,
            longitude: newPos.lon,
            fileName, // Lambda에는 이 값이 현재 사용되지 않지만 필요하다면 로직 추가
          });

          // Lambda로부터 프리사인 URL과 메타데이터 추출
          const { uploadUrl, metadata } = presignedUrlResponse.data;
          console.log(presignedUrlResponse.data)
          console.log("프리사인 URL:", uploadUrl);
          console.log("S3 메타데이터:", metadata);

          // 단순화된 헤더
          const headers = {
            "Content-Type": "image/jpeg"
          };

          await axios.put(uploadUrl, blob, { headers });
          

          console.log("파일이 S3에 성공적으로 업로드되었습니다.");
        } catch (error) {
          console.error("업로드 과정 중 오류:", error);
          if (error.response) {
            console.error("에러 응답:", error.response.data);
            console.error("상태 코드:", error.response.status);
          }
        }
      },
      (error) => {
        console.error("위치 정보 가져오기 실패:", error);
      }
    );
  };

  return (
    <div>
      <button onClick={sendFileToS3}>파일 전송</button>
      {pos.lat && pos.lon && (
        <p>
          위치: {pos.lat}, {pos.lon}
        </p>
      )}
    </div>
  );
}

export default NotifyButton;
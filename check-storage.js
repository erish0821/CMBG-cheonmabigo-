/**
 * AsyncStorage 데이터 확인 스크립트
 */

const fs = require('fs');
const path = require('path');

// 웹 환경에서는 localStorage 사용
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('=== Web localStorage 데이터 ===');

  // 거래 데이터 확인
  const transactionData = localStorage.getItem('@CheonmaBigo:transactions');
  if (transactionData) {
    const transactions = JSON.parse(transactionData);
    console.log('거래 개수:', transactions.length);
    console.log('첫 번째 거래:', transactions[0]);
    console.log('최근 거래 5개:');
    transactions.slice(0, 5).forEach((tx, index) => {
      console.log(`${index + 1}.`, {
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        date: tx.date,
        isIncome: tx.isIncome
      });
    });
  } else {
    console.log('저장된 거래 데이터가 없습니다.');
  }

  // 메타데이터 확인
  const metaData = localStorage.getItem('@CheonmaBigo:transaction_metadata');
  if (metaData) {
    console.log('메타데이터:', JSON.parse(metaData));
  }

} else {
  console.log('웹 환경이 아니거나 localStorage를 사용할 수 없습니다.');
}

// Node.js 환경에서 실행되는 경우
if (typeof module !== 'undefined' && module.exports) {
  console.log('=== Node.js 환경에서 실행 ===');
  console.log('이 스크립트는 브라우저에서 실행해야 합니다.');
}
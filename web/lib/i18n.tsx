"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ko";

export const translations = {
  en: {
    topBar: {
      logoText: "on-chain kye",
      dashboard: "Dashboard",
      home: "Home",
      howItWorks: "How it works",
      faq: "FAQ",
      docs: "Docs",
      connectedTo: "Connected to",
      testnetNotice: "testnet, mock KRW (not real funds)",
      notWiredTitle: "Contracts not wired yet",
      notWiredDesc: "Deploy with forge script script/Deploy.s.sol, then set env variables in web/.env.local. The UI will light up once set.",
    },
    landing: {
      heroTitleFaint: "Save with friends.",
      heroTitleStrong: "No one runs off with it.",
      lead: "A trustless, on-chain kye (곗돈). Rotating savings circles where the smart contract holds the pot, not an organizer who could run off with it.",
      badgeCustody: "Non-custodial by design",
      badgeSpeed: "~1s payouts on GIWA",
      openDashboard: "Open dashboard",
      closingTitle: "Start a circle with people you trust. Let the contract handle the rest.",
      footerNotice: "testnet | mock KRW, not real funds | Docs | Explorer",
    },
    info: {
      howItWorksTitle: "How Jjan works",
      howItWorksSub: "Jjan keeps the social ritual of a kye intact and removes the trust it used to require. The contract becomes the organizer — one that cannot lie, forget, or run off with the money.",
      createTitle: "Create",
      createDesc: "An organizer sets the members, the contribution amount per round, the bond, and the payout order. One transaction spins up a new circle.",
      joinTitle: "Join",
      joinDesc: "Each invited member opens a share link and joins in two taps, posting their bond. The onboarding feels like a Web2 app.",
      contributeTitle: "Contribute",
      contributeDesc: "Every round, each member pays the fixed amount into the contract's escrow. Miss a round and part of your bond is slashed into the pot.",
      rotateTitle: "Rotate",
      rotateDesc: "Once the round window elapses, the contract pays that round's scheduled recipient automatically—in about a second on GIWA—and advances to the next round.",
      trustlessTitle: "What makes Jjan trustless",
      trustlessItem1: "The pot is never in a person's hands. Contributions sit in the contract's escrow and can only move to the round's pre-agreed recipient.",
      trustlessItem2: "The recipient is fixed in advance. Payout order is set when the circle is created, so no one can manipulate who gets paid.",
      trustlessItem3: "Everyone sees the same truth. Every contribution, payout, and slash is an on-chain event.",
      trustlessItem4: "Reliability is portable. Paying on time (or missing) updates an on-chain reputation score that follows your wallet.",
      faqTitle: "Frequently Asked Questions",
      q1: "Who has custody of the funds?",
      a1: "The Circle smart contract holds the funds. There is no owner, admin key, or multi-sig that can override the state machine or withdraw funds to a custom address. Funds leave the contract only via closeRound (to the round's designated recipient) or withdrawBond (returning the security bond to its owner).",
      q2: "What happens if a member defaults/misses a round?",
      a2: "If a member fails to contribute by the end of a round, a portion of their security bond (equal to the contribution amount) is slashed and added directly to the pot. This protects other members, ensuring the round recipient still gets paid their expected amount.",
      q3: "Why GIWA network?",
      a3: "A savings circle requires multiple recurring transactions (joins, contributions, payouts). Doing this on Ethereum L1 or expensive L2s would eat up the savings in gas. GIWA offers 1-second block times and gas fees under a fraction of a cent, making the user experience seamless.",
      q4: "Who can call closeRound?",
      a4: "Anyone can. Once the round timer reaches 0:00, the closeRound() transaction becomes open to the public. It doesn't rely on the organizer or the recipient to be online.",
    },
    dashboard: {
      checkingWallet: "Checking your wallet…",
      connectWallet: "Connect your wallet",
      connectDesc: "The dashboard needs a wallet on GIWA Sepolia to read your circles and sign contributions.",
      switchNetwork: "Switch to GIWA Sepolia",
      wrongChainDesc: "Your wallet is on the wrong network. Jjan runs on GIWA Sepolia (chain {id}). Switch networks to create or join a circle.",
      switching: "Switching…",
      allCircles: "All circles",
      circlesHeader: "Circles",
      createdCount: "{count} created",
      noCircles: "No active circles. Start one above or click 'Show all' to restore.",
      noCirclesNone: "No circles yet. Start one above.",
      showAll: "Show all ({count} hidden)",
    },
    faucet: {
      stablecoinBalance: "test stablecoin balance",
      forGas: "for gas",
      getTestTokens: "Get 1,000,000 test mKRW",
      confirmWallet: "Confirm in wallet…",
      minting: "Minting…",
    },
    create: {
      title: "Start a savings circle",
      desc: "Everyone contributes each round; the pot rotates. The contract holds the money, not you.",
      circleNameLabel: "Circle name (optional)",
      circleNamePlaceholder: "e.g. Friday Lunch Club, Family Savings…",
      memberWalletsLabel: "Member wallets (in payout order)",
      addMyWallet: "+ Add my wallet",
      addedMyWallet: "You're added",
      memberInputPlaceholder: "0xMember {num} address…",
      addMember: "+ Add member",
      contributionLabel: "Contribution / round (mKRW)",
      bondLabel: "Bond (mKRW)",
      roundLengthLabel: "Round length (minutes)",
      createBtn: "Create circle",
      confirmWallet: "Confirm in wallet…",
      creating: "Creating…",
      created: "Created",
      errMinMembers: "Add at least 2 member addresses.",
      errInvalidAddr: "Not a valid wallet address: {addr}",
      errDuplicateAddr: "Duplicate address. Each member must appear once.",
    },
    detail: {
      finished: "Finished",
      waitingMembers: "Waiting for members",
      roundOf: "Round {current} of {total}",
      mkrwRound: "mKRW / round",
      members: "members",
      bond: "bond",
      potRound: "pot / round",
      roundRecipient: "Round {num} recipient",
      statusJoined: "Joined",
      statusNotJoined: "Not joined",
      warningJoinedAll: "Cannot start circle until all invited members have joined and deposited their bonds.",
      warningAllowance: "Allowance insufficient. You must click '1. Approve mKRW' and confirm the approval transaction first.",
      warningRoundNotOver: "Round is not over yet. Please wait {time} before closing.",
      approveBtn: "1. Approve mKRW",
      approvedBtn: "mKRW Approved",
      joinBtn: "2. Join",
      startCircle: "Start circle",
      startCircleStatus: "Start circle ({joined}/{total} joined)",
      contributeBtn: "Contribute this round",
      contributedBtn: "Contributed",
      closeRoundPay: "Close round, pay out",
      closeRoundTimer: "Close round ({time})",
      withdrawBond: "Withdraw bond",
      bondClaimed: "Bond claimed",
      working: "Working…",
      nonCustodialNotice: "Payout goes to the round's scheduled member automatically. There is no function anywhere that lets the organizer take the pot.",
      renameBtn: "Rename",
      saveBtn: "Save",
      cancelBtn: "Cancel",
      renamePlaceholder: "Name this circle…",
    },
    row: {
      youreIn: "You're in",
      yourTurn: "Your turn",
      forming: "Forming",
      finished: "Finished",
      roundN: "Round {num} / {total}",
      membersCount: "{count} members",
      potCount: "{amount} mKRW pot",
      open: "Open",
      hide: "Hide this circle",
    },
    footer: {
      builtBy: "Built with ♥ by",
      forProgram: "for the",
      programName: "GIWA x Upbit Ecosystem Program (GASOK)",
    }
  },
  ko: {
    topBar: {
      logoText: "온체인 곗돈",
      dashboard: "대시보드",
      home: "홈",
      howItWorks: "작동 방식",
      faq: "자주 묻는 질문",
      docs: "문서",
      connectedTo: "연결됨:",
      testnetNotice: "테스트넷, 모의 KRW (실제 자산 아님)",
      notWiredTitle: "컨트랙트가 아직 설정되지 않았습니다",
      notWiredDesc: "forge script script/Deploy.s.sol로 배포한 후 web/.env.local에 환경 변수를 설정해주세요. 설정이 완료되면 UI가 활성화됩니다.",
    },
    landing: {
      heroTitleFaint: "친구들과 함께 모으고,",
      heroTitleStrong: "아무도 먹튀하지 못하게.",
      lead: "신뢰가 필요 없는 온체인 곗돈, 짠(Jjan). 주선자 개인 계좌가 아닌 블록체인 스마트 컨트랙트가 안전하게 곗돈을 보관하고 순번에 맞게 지급합니다.",
      badgeCustody: "완전한 비수탁형 설계",
      badgeSpeed: "GIWA 체인상 약 1초 내 지급 완료",
      openDashboard: "대시보드 열기",
      closingTitle: "신뢰할 수 있는 사람들과 곗방을 만드세요. 자금 관리는 스마트 컨트랙트가 알아서 처리합니다.",
      footerNotice: "테스트넷 | 모의 KRW (실제 자산 아님) | 문서 | 블록 탐색기",
    },
    info: {
      howItWorksTitle: "짠(Jjan) 작동 방식",
      howItWorksSub: "전통적인 '계'의 친목 기능과 금융 순환 구조는 그대로 유지하되, 주선자를 믿어야만 했던 신뢰 위험을 제거했습니다. 블록체인 컨트랙트가 거짓말도, 먹튀도 하지 않는 완벽한 주선자 역할을 수행합니다.",
      createTitle: "1. 곗방 생성",
      createDesc: "방장이 참여 멤버, 라운드별 곗돈 납입액, 보증금, 수령 순번을 설정합니다. 트랜잭션 한 번으로 새로운 온체인 곗방이 개설됩니다.",
      joinTitle: "2. 곗방 참여",
      joinDesc: "초대받은 멤버들이 공유 링크를 통해 접속하여 2번의 탭만으로 보증금을 예치하고 참여합니다. 소셜 로그인 연동 시 Web2 앱처럼 편리합니다.",
      contributeTitle: "3. 라운드별 납입",
      contributeDesc: "매 라운드가 시작되면 모든 멤버는 약정된 곗돈을 컨트랙트 에스크로에 입금합니다. 납입금을 기한 내에 내지 않으면 예치된 보증금 중 일부가 자동으로 삭감(슬래싱)되어 곗돈에 충당됩니다.",
      rotateTitle: "4. 순번별 수령 및 순환",
      rotateDesc: "라운드 기한이 만료되면, 컨트랙트는 이번 라운드 수령자에게 곗돈을 즉시 지급하고(GIWA 체인에서 약 1초 소요) 자동으로 다음 라운드로 전환합니다.",
      trustlessTitle: "짠(Jjan)이 안전한 이유",
      trustlessItem1: "자금이 개인 손에 거쳐가지 않습니다. 모든 곗돈은 스마트 컨트랙트에 보관되며, 오직 지정된 라운드 수령자에게만 전달될 수 있습니다.",
      trustlessItem2: "수령 순번은 사전에 고정됩니다. 곗방 생성 시 수령 순서가 확정되어 중간에 임의로 변경할 수 없습니다.",
      trustlessItem3: "모두가 동일한 사실을 확인합니다. 모든 납입, 지급, 보증금 차감 내역이 온체인 상에 투명하게 기록됩니다.",
      trustlessItem4: "신뢰도가 점수화됩니다. 납입 기한 준수 여부가 개인 지갑의 온체인 평판 점수(Reputation Score)에 기록되어 다음 곗방 참여 시 영향을 줍니다.",
      faqTitle: "자주 묻는 질문",
      q1: "곗돈은 누가 보관하고 관리하나요?",
      a1: "곗돈은 전적으로 짠(Jjan) 스마트 컨트랙트가 보관합니다. 관리자 키나 멀티시그가 존재하지 않아 개발자나 주선자라 하더라도 자금을 다른 주소로 출금할 수 없습니다. 자금은 오직 라운드 마감(지정된 수령자에게 지급) 또는 보증금 인출(계가 끝난 후 반환)을 통해서만 컨트랙트 외부로 이동할 수 있습니다.",
      q2: "멤버가 돈을 내지 않고 잠수 타면 어떻게 되나요?",
      a2: "라운드 마감 전까지 납입하지 않으면, 해당 멤버가 처음에 걸어둔 보증금에서 곗돈만큼 삭감(슬래싱)되어 곗돈 팟에 합산됩니다. 이를 통해 성실하게 납입한 수령자는 연체자가 있더라도 약정된 곗돈을 차질 없이 전액 지급받을 수 있습니다.",
      q3: "왜 GIWA(기와) 네트워크를 사용하나요?",
      a3: "곗방 운영에는 참여, 납입, 지급 등 다수의 반복적인 온체인 트랜잭션이 수반됩니다. 가스비가 비싼 이더리움 L1 등에서는 수수료 배보다 배꼽이 더 커집니다. 1초 미만의 블록 타임과 사실상 0원에 수렴하는 초저렴 가스비를 제공하는 GIWA 체인 덕분에 사용자들은 수수료 걱정 없이 편안하게 이용할 수 있습니다.",
      q4: "closeRound(라운드 마감)는 누가 실행할 수 있나요?",
      a4: "라운드 타이머가 0:00이 되면 누구나 실행할 수 있습니다. 특정 관리자나 수령자가 직접 온라인 상태여야 할 필요가 없으며, 봇이나 제3자가 실행해 줄 수도 있습니다.",
    },
    dashboard: {
      checkingWallet: "지갑 연결 상태 확인 중…",
      connectWallet: "지갑 연결하기",
      connectDesc: "곗방 상태를 조회하고 트랜잭션에 서명하려면 GIWA Sepolia 네트워크 지갑이 필요합니다.",
      switchNetwork: "GIWA Sepolia 네트워크로 전환",
      wrongChainDesc: "지갑 네트워크 설정이 올바르지 않습니다. 짠(Jjan)은 GIWA Sepolia(체인 ID {id})에서 작동합니다. 지갑을 전환하여 시작하세요.",
      switching: "전환 중…",
      allCircles: "전체 곗방 목록",
      circlesHeader: "내 곗방",
      createdCount: "{count}개 생성됨",
      noCircles: "활성화된 곗방이 없습니다. 상단에서 새로 만들거나 '모두 보기'를 클릭해 숨겨진 곗방을 확인하세요.",
      noCirclesNone: "생성된 곗방이 없습니다. 상단에서 새로운 곗방을 시작해보세요.",
      showAll: "모두 보기 ({count}개 숨김)",
    },
    faucet: {
      stablecoinBalance: "테스트 스테이블코인 잔액",
      forGas: "가스비 잔액",
      getTestTokens: "1,000,000 테스트 mKRW 받기",
      confirmWallet: "지갑에서 승인 대기 중…",
      minting: "민팅 중…",
    },
    create: {
      title: "새로운 곗방 시작하기",
      desc: "매 라운드마다 함께 모으고 차례대로 탑니다. 돈은 개인이 아닌 스마트 컨트랙트가 안전하게 관리합니다.",
      circleNameLabel: "곗방 이름 (선택사항)",
      circleNamePlaceholder: "예: 금요 맛집 동호회, 가족 여행 적금…",
      memberWalletsLabel: "참여 멤버 지갑 주소 (곗돈 탈 순서대로 입력)",
      addMyWallet: "+ 내 지갑 추가",
      addedMyWallet: "내 주소 추가됨",
      memberInputPlaceholder: "멤버 {num} 지갑 주소(0x...) 입력…",
      addMember: "+ 멤버 추가",
      contributionLabel: "라운드당 납입금액 (mKRW)",
      bondLabel: "보증금 (mKRW)",
      roundLengthLabel: "라운드 주기 (분 단위)",
      createBtn: "곗방 만들기",
      confirmWallet: "지갑에서 승인 대기 중…",
      creating: "곗방 생성 중…",
      created: "생성 완료",
      errMinMembers: "최소 2명 이상의 멤버 주소를 추가해주세요.",
      errInvalidAddr: "올바르지 않은 지갑 주소입니다: {addr}",
      errDuplicateAddr: "중복된 지갑 주소입니다. 모든 멤버는 한 번씩만 포함되어야 합니다.",
    },
    detail: {
      finished: "계 종료",
      waitingMembers: "멤버 참여 대기 중",
      roundOf: "라운드 {current} / {total}",
      mkrwRound: "라운드당 납입액",
      members: "참여 멤버",
      bond: "예치 보증금",
      potRound: "라운드당 총 곗돈",
      roundRecipient: "라운드 {num} 수령 예정자",
      statusJoined: "참여 완료",
      statusNotJoined: "미참여",
      warningJoinedAll: "초대된 모든 멤버가 보증금을 납입하고 참여해야 곗방을 시작할 수 있습니다.",
      warningAllowance: "승인 잔액이 부족합니다. 먼저 '1. mKRW 사용 승인' 버튼을 눌러 승인 트랜잭션을 처리해야 합니다.",
      warningRoundNotOver: "라운드 기한이 아직 만료되지 않았습니다. 마감까지 {time} 만큼 기다려야 합니다.",
      approveBtn: "1. mKRW 사용 승인",
      approvedBtn: "mKRW 승인 완료",
      joinBtn: "2. 곗방 참여",
      startCircle: "계 시작하기",
      startCircleStatus: "계 시작하기 ({joined}/{total}명 참여)",
      contributeBtn: "이번 라운드 곗돈 납입",
      contributedBtn: "납입 완료",
      closeRoundPay: "라운드 마감 및 곗돈 지급",
      closeRoundTimer: "라운드 마감 ({time} 대기)",
      withdrawBond: "보증금 돌려받기",
      bondClaimed: "보증금 반환 완료",
      working: "처리 중…",
      nonCustodialNotice: "곗돈은 라운드 순서에 맞춰 멤버에게 자동 지급됩니다. 컨트랙트 코드상 주선자나 특정인이 전체 자금을 먹튀하는 기능은 존재하지 않습니다.",
      renameBtn: "이름 변경",
      saveBtn: "저장",
      cancelBtn: "취소",
      renamePlaceholder: "곗방 이름 지정…",
    },
    row: {
      youreIn: "참여 중",
      yourTurn: "내 수령 차례",
      forming: "멤버 모집 중",
      finished: "만기 완료",
      roundN: "라운드 {num} / {total}",
      membersCount: "멤버 {count}명",
      potCount: "총 곗돈 {amount} mKRW",
      open: "보기",
      hide: "곗방 숨기기",
    },
    footer: {
      builtBy: "ritesh5969가 ♥으로 제작",
      forProgram: "참여 프로젝트: ",
      programName: "GIWA x Upbit 에코시스템 프로그램 (GASOK)",
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("jjan_language");
    if (stored === "ko" || stored === "en") {
      setLanguageState(stored);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === "ko") {
        setLanguageState("ko");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("jjan_language", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

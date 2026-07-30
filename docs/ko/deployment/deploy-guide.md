# 직접 배포하기

Jjan 컨트랙트 전체 스택은 하나의 Foundry 스크립트를 사용하여 GIWA Sepolia 테스트넷에 손쉽게 배포할 수 있습니다.

## 사전 요구 사항

* [Foundry](https://getfoundry.sh) 설치 완료 (`forge`, `cast` 명령어 필요).
* [GIWA 수도꼭지](giwa-network.md#faucets)를 통해 테스트용 가스비 ETH가 충전된 **테스트넷 전용 임시** 지갑 주소.
  *(보안을 위해 절대 메인넷 자산이 들어있는 개인키를 사용하지 마세요.)*

## 1. 환경 설정

설정 예시 파일을 복사하고 자신의 지갑 개인키(Private Key)를 기입합니다. (GIWA 네트워크 연결 경로는 이미 설정되어 있습니다):

```bash
cd jjan
cp .env.example .env
# .env 파일을 열고 PRIVATE_KEY=0x... 에 개인키를 입력합니다.
```

## 2. 빌드 및 테스트 확인

```bash
forge build
forge test          # 9/9 개의 테스트가 모두 통과하는지 확인합니다.
```

## 3. 계약 배포 및 소스 코드 검증 (Verify)

```bash
source .env
forge script script/Deploy.s.sol \
  --rpc-url giwa_testnet --broadcast --verify \
  --verifier blockscout \
  --verifier-url https://sepolia-explorer.giwa.io/api/
```

스크립트가 성공적으로 종료되면 배포 완료된 4개의 주소가 콘솔에 출력됩니다. 이 배포 스크립트는 `vm.computeCreateAddress` 명령어로 팩토리 배포 예정 주소를 사전에 계산함으로써, 평판 레지스트리 생성자 단계에 팩토리 주소를 `immutable` 상수로 온전히 주입하여 상호 순환 의존성을 깔끔하게 해결합니다.

## 4. 프론트엔드 연결

콘솔에 출력된 주소값들을 `jjan/web/.env.local` 파일에 대입해 줍니다:

```env
NEXT_PUBLIC_GIWA_CHAIN_ID=91342
NEXT_PUBLIC_GIWA_RPC_URL=https://sepolia-rpc.giwa.io/
NEXT_PUBLIC_FACTORY=0x... (배포된 팩토리 주소)
NEXT_PUBLIC_REPUTATION=0x... (배포된 평판 주소)
NEXT_PUBLIC_MKRW=0x... (배포된 스테이블코인 주소)
```

이후 프론트엔드 웹 서비스를 가동합니다:

```bash
cd web && npm install && npm run dev   # http://localhost:3005 에서 실행
```

## 5. (선택사항) 데모용 곗방 생성

이미 배포된 계약들을 기반으로 데모 시연에 필요한 초단기 진행 조건(예: 1분 라운드 간격 등)의 테스트용 실시간 곗방을 자동으로 생성합니다:

```bash
FACTORY=0x.. MKRW=0x.. M1=0x.. M2=0x.. M3=0x.. \
forge script script/DemoCircle.s.sol --rpc-url giwa_testnet --broadcast
```

{% hint style="warning" %}
`PRIVATE_KEY` 개인키가 실수로 외부 깃허브 등에 유출되지 않도록 각별히 유의하세요. `.env` 파일은 `.gitignore`에 의해 깃 관리 대상에서 배제됩니다. 이 프로젝트에 내장된 `MockKRW`는 가상의 테스트넷 화폐이며, 보안 진단을 거치지 않은 현 상태의 코드를 실제 자금이 이동하는 메인넷 상용 서비스 용도로 취급하지 마십시오.
{% endhint %}

# 배포된 컨트랙트 목록

모든 스마트 컨트랙트는 GIWA Sepolia (체인 ID `91342`) 테스트넷 상에 **실시간으로 배포되고 소스 코드 검증(Source-verified)**을 완료하였습니다. 아래 주소를 클릭하면 블록 탐색기에서 상세 Solidity 소스 코드를 투명하게 확인할 수 있습니다.

## 계약 주소 목록

| 컨트랙트 이름 | 온체인 지갑 주소 |
| --- | --- |
| **CircleFactory** | [`0x7f01efFDbEe10d31f300E2b3Fed000C061940551`](https://sepolia-explorer.giwa.io/address/0x7f01efFDbEe10d31f300E2b3Fed000C061940551) |
| **ReputationRegistry** | [`0x0cd53f090471d4aD3f14bEFaC1F60D7F3F076204`](https://sepolia-explorer.giwa.io/address/0x0cd53f090471d4aD3f14bEFaC1F60D7F3F076204) |
| **MockKRW (mKRW)** | [`0x6F82D1b448C3e742e2Da3455611c268C6D72f53B`](https://sepolia-explorer.giwa.io/address/0x6F82D1b448C3e742e2Da3455611c268C6D72f53B) |
| **Circle (로직 원본)** | [`0xf2b12af647ecf2341960e901e4ee8ba55639377b`](https://sepolia-explorer.giwa.io/address/0xf2b12af647ecf2341960e901e4ee8ba55639377b) |

디플로이어(배포자 계정): `0xA273683BE2B645a174164C01c71f2d035c39E7EC`

## 데모 테스트용 곗방 정보

블록 탐색기에서 직접 추적하고 검증할 수 있는 두 개의 곗방입니다. 두 곗방 모두 전체 라운드를 끝까지 완주했습니다.

### 3인 곗방

[`0x23b3B64C57E721D1f21Dcb429e7d709A9732A108`](https://sepolia-explorer.giwa.io/address/0x23b3B64C57E721D1f21Dcb429e7d709A9732A108)

| 구분 | 정보 및 세부 사항 |
| --- | --- |
| 규칙 조건 | 라운드당 납입액: 100,000 mKRW · 보증금: 50,000 mKRW · 라운드 시간: 60초 · 총 3라운드 |
| 현재 상태 | 종료(Finished) — 3개 라운드 전부 마감 완료, 각 멤버가 정확히 한 번씩 곗돈 수령 |
| 라운드 1 | `0xA273…E7EC`에게 총 300,000 mKRW 지급 완료 ([tx 상세](https://sepolia-explorer.giwa.io/tx/0xbaa35cd44cae0c4a7680457168170787a3fb6677b8fcbcfb94ac85cefad04caf)) |
| 현재 잔액 | 50,000 mKRW — 아직 인출하지 않은 멤버 1명의 보증금입니다. `obligations()` 호출 결과가 이 금액과 정확히 일치하므로, 자금 지급 능력 불변식(Solvency Invariant)이 테스트뿐 아니라 온체인 상에서도 실제로 성립함을 확인할 수 있습니다. |

### 2인 곗방 (데모 영상에 등장하는 곗방)

[`0x4a63320923cc0395bb9E3FC9b319C64854676724`](https://sepolia-explorer.giwa.io/address/0x4a63320923cc0395bb9E3FC9b319C64854676724)

| 구분 | 정보 및 세부 사항 |
| --- | --- |
| 규칙 조건 | 라운드당 납입액: 100,000 mKRW · 보증금: 50,000 mKRW · 라운드 시간: 60초 · 총 2라운드 |
| 현재 상태 | 종료 및 완전 정산 완료 — 2회 지급 및 보증금 2건 인출까지 모두 마쳐 토큰 잔액 `0` |

{% hint style="success" %}
위의 모든 주소는 블록체인 탐색기 상에서 초록색 **Verified** 체크 표시를 획득하였습니다. 배포된 바이트코드가 깃허브에 게시된 Solidity 소스 코드와 정확히 일치함을 확인하는 공인 마크입니다.
{% endhint %}

## 빠른 조회 확인 방법 (Foundry cast 활용)

배포된 컨트랙트는 표준 이더리움 호환 API를 지원하므로 [Foundry](https://getfoundry.sh)의 `cast` 명령어로 즉시 조회해 볼 수 있습니다:

```bash
# 생성된 총 곗방의 개수 조회
cast call 0x7f01efFDbEe10d31f300E2b3Fed000C061940551 \
  "circleCount()(uint256)" --rpc-url https://sepolia-rpc.giwa.io/

# 테스트 스테이블코인의 심볼 조회
cast call 0x6F82D1b448C3e742e2Da3455611c268C6D72f53B \
  "symbol()(string)" --rpc-url https://sepolia-rpc.giwa.io/
```

## 테스트 토큰 충전 방법 (CLI 활용)

`MockKRW` 토큰은 별도의 제한이 없는 오픈 수도꼭지(Faucet) 함수를 탑재하고 있어 누구나 테스트 자금을 수령할 수 있습니다:

```bash
# 본인 주소로 1,000,000 mKRW (소수점 18자리) 발행
cast send 0x6F82D1b448C3e742e2Da3455611c268C6D72f53B \
  "faucet(uint256)" 1000000000000000000000000 \
  --rpc-url https://sepolia-rpc.giwa.io/ --private-key <테스트넷_개인키>
```

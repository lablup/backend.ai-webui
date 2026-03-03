# Model Service

## Runtime Variant

일반적인 Model Service 실행 흐름에서는 서비스를 실행하기 위해 모델 폴더에 model-definition.yaml 파일이 반드시 포함되어야 합니다 ([ref](https://webui.docs.backend.ai/ko/latest/model_serving/model_serving.html#creating-a-model-definition-file)). Model Service를 생성하거나 수정할 때 특정 run_variant 파라미터를 지정하면, model-definition.yaml 없이도 Model Service를 실행할 수 있습니다.

### 요구 조건
- Backend.AI 24.03.5 이상 (모델 서비스 기능 활성화 필요)
- Runtime Variant 기능을 지원하는 Backend.AI 커널 이미지
  - NGC-NIM 이미지
  - vLLM 이미지 (0.5.0 이상)
  - 기타 사용자 생성 이미지, `CMD` 값 지정 필요 (자세한 사항은 하기의 `Predefined Image Command` 단락 참고)

### API를 통해 Runtime Variant 지정하기
REST API를 이용해 새로운 모델 서비스를 생성하려는 경우 `runtime_variant` 파라미터를 요청 바디에 명시해야 합니다. GQL Mutation을 이용해 기존 모델 서비스의 Runtime Variant를 변경하려는 경우 `ModifyEndpointInput` 객체의 `runtime_variant` 파라미터에 값을 지정하면 됩니다. `GET /services/_/runtimes` REST API를 이용해 현재 사용 가능한 Runtime Variant를 확인할 수 있습니다. 각 Runtime Variant의 `name` 필드에 지정된 값이 `runtime_variant` 파라미터로 사용할 수 있는 값입니다.

### Runtime Variant 종류
- CUSTOM (기본 값)
  model-definition.yaml 파일을 읽고 모델 서버 실행 명령어를 추론하여 Model Service를 시작합니다.
- CMD
  이미지에 지정된 CMD 명령어를 모델 서버 실행 명령어로 간주하고 Model Service를 실행합니다. 이 값을 사용할 경우 Health Check 기능이 지원되지 않습니다.
- VLLM
  CMD 모드와 동일한 역할을 합니다. vLLM 모델 서버를 기준으로 Health Check Endpoint를 설정합니다. VLLM 모드로 모델을 실행하려면 아래의 요구 조건을 충족해야 합니다.
    - Checkpoint가 VFolder의 root 아래 존재
    - 환경 변수 추가
      - BACKEND_MODEL_NAME : vLLM의 --model-name 에 대응
      - VLLM_QUANTIZATION (선택): vLLM의 --quantization 에 대응
      - VLLM_TP_SIZE (선택): vLLM의 --tensor-parallel-size 에 대응
      - VLLM_PP_SIZE (선택): vLLM의 --pipeline-parallel-size 에 대응
      - VLLM_EXTRA_ARGS (선택): 위에 언급된 파라미터 이외의 값을 vLLM에 추가하고 싶은 경우
      - 예시: VLLM_EXTRA_ARGS="--tokenizer=/models/custom-tokenizer --dtype=half"
- NIM
  CMD 모드와 동일한 역할을 합니다. NVIDIA NIM 모델 서버를 기준으로 Health Check Endpoint를 설정합니다. NIM 모드로 모델을 실행하려면 아래의 요구 조건을 충족해야 합니다.
    - 환경 변수 추가
      - NGC_API_KEY: NGC의 NIM Model Registry에 접근 가능한 계정으로부터 생성된 API Key

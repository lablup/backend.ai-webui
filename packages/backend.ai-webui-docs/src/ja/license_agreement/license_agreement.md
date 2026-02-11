# ライセンス契約の条件

## Backend.AI ライセンス (ソフトウェア)

このドキュメントは、Backend.AI ソフトウェアのライセンス契約の条件を定義しています。Lablup によって提供される Backend.AI クラウドサービスの使用料およびサポートプランは、このポリシーとは無関係です。

Backend.AI server components (hereinafter referred to as "Backend.AI Server")
are distributed under the GNU Lesser General Public License v3.0 ("LGPL"), and
API Client libraries and auxiliary components for accessing Backend.AI server
(hereinafter "Backend.AI Client") are distributed under the MIT License. Even if
LGPL complies, commercial contracts with Lablup Co., Ltd. ("Lablup") are
required depending on the conditions when performing profit activities using the
Backend.AI server. Several additional plug-ins and 管理者's GUI Control-Panel
that apply to Backend.AI enterprise solutions are not open source, but
commercial software.

**用語の定義**

- ハードウェア: 所有またはリースし、ソフトウェアを実行する権利がある物理コンピュータ、仮想マシン、およびコンテナ環境を含みます。
- 組織: 個人、法人、団体、機関（非営利および商業組織を含む。ただし、独立した法人である子会社は含まれない）

LGPL は、ユーザーが Backend.AI Server（Manager / Agent / Common）を使用および変更する場合、またはそれを使用するソフトウェアを開発および配布する場合に従わなければなりません。ただし、Backend.AI サーバーをモジュールとしてインポートし、変更せずにソフトウェアを配布する場合（例：Python のインポート）、それは動的リンクと見なされ、LGPL に基づくコードの公開は免除されます。Backend.AI サーバーがハードウェアにインストールされ、ネットワークを通じて一般に使用される場合、LGPL に基づく義務はありません。

他のすべてのケースの正しい解釈は、LGPLの原文と裁判所の判断に従います。

LGPLコンプライアンスとは別に、以下の場合はLablupとの商業契約を結ぶ必要があります。

#. Backend.AIサーバーをインストールした後にのみ動作するソフトウェアが、組織外の顧客に販売される場合。
#. 組織外の顧客にBackend.AIサーバーを含むハードウェアが販売される場合。
#. Backend.AIサーバーがハードウェアにインストールされ、それを使用する組織外の顧客から使用料金が受け取られる場合。

その他のケースでは、無料でBackend.AIサーバーを利用できます。

**解釈例**

- Backend.AIサーバーを組織外に修正して配布する場合、コードを公開し、同じ方法でLGPLを適用する必要があります。内部でのみ使用する場合、コードを公開する義務はありません。
- Backend.AIサーバーを主要なライブラリとして使用するソフトウェアを配布する際には、

  - 無償配布: ソフトウェアは (L)GPL である必要はなく、Lablup との別途契約も必要ありません。
  - 有料配布: ソフトウェアは (L)GPL である必要はありませんが、Lablup と商業契約が必要です。

- Backend.AIサーバーがハードウェアにインストールされ、ネットワークを通じて一般に使用される場合、

  - 無料配布: Lablupとの別途契約は必要ありません。
  - 有料配布: Lablupとの商業契約が必要です。

- Backend.AIサーバーがインストールされているハードウェアを配布する際に、

  - 無料配布: Lablupとの別途契約は必要ありません。
  - 有料配布: Lablupとの商業契約が必要です。

商業契約には、デフォルトでエンタープライズ版の月額／年額サブスクリプション料金が含まれていますが、詳細は個々の契約によって異なる場合があります。
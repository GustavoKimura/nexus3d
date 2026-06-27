# Nexus3D

**Nexus3D** is an advanced 3D LiDAR surveying web application. It processes telemetry point cloud data from surveying robots, analyzes data density and noise loss using Open3D, visualizes the 3D points on a modern web interface, and automatically generates an AI-powered technical report assessing the viability of the scan for creating Digital Twins.

[日本語版は下にあります (Japanese version below)](#nexus3d-日本語)

---

## 🚀 Key Features

- **Robot Fleet Management:** Register and track online/offline robotic surveying units.
- **Point Cloud Processing:** Upload `.xyz` or `.txt` LiDAR scans for immediate processing.
- **Sample Generation:** Built-in generative engine for testing with mathematical 3D shapes.
- **AI Technical Reports:** Automated assessment of valid points, noise loss, and terrain height using OpenAI GPT-4o.
- **3D Visualization:** High-performance, interactive 3D rendering of point clouds using Three.js and React Three Fiber.
- **Multilingual Support:** Fully internationalized interface (English and Japanese).

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, React Three Fiber.
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, PostgreSQL, Open3D, OpenAI API.
- **Infrastructure:** Docker, Docker Compose.

## ⚙️ Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed.
- An active [OpenAI API Key](https://platform.openai.com/).

## 🏃 Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd nexus3d
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` in the root directory and insert your OpenAI API key.

   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Start the application using Docker Compose:**

   ```bash
   docker-compose up -d --build
   ```

4. **Access the application:**
   - **Web Client:** http://localhost:3000
   - **API Documentation (Swagger):** http://localhost:8000/docs

---

<a name="nexus3d-日本語"></a>

# Nexus3D (日本語)

**Nexus3D** は、高度な3D LiDAR測量Webアプリケーションです。測量ロボットからのテレメトリ点群データを処理し、Open3Dを使用してデータ密度とノイズ損失を分析します。最新のWebインターフェースで3Dポイントを視覚化し、デジタルツイン作成のためのスキャンの実行可能性を評価するAI駆動の技術レポートを自動生成します。

## 🚀 主な機能

- **ロボットフリート管理:** オンライン/オフラインの測量ロボットユニットの登録と追跡。
- **点群処理:** `.xyz` または `.txt` のLiDARスキャンをアップロードして即時処理。
- **サンプル生成:** 数学的な3D形状によるテスト用の組み込み生成エンジン。
- **AI技術レポート:** OpenAI GPT-4oを使用した、有効なポイント、ノイズ損失、地形の高さの自動評価。
- **3Dビジュアライゼーション:** Three.jsとReact Three Fiberを使用した点群の高性能でインタラクティブな3Dレンダリング。
- **多言語サポート:** 完全に国際化されたインターフェース（英語と日本語）。

## 🛠 技術スタック

- **フロントエンド:** React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, React Three Fiber.
- **バックエンド:** Python 3.11, FastAPI, SQLAlchemy, PostgreSQL, Open3D, OpenAI API.
- **インフラストラクチャ:** Docker, Docker Compose.

## ⚙️ 前提条件

- [Docker](https://www.docker.com/) と Docker Compose がインストールされていること。
- 有効な [OpenAI API Key](https://platform.openai.com/)。

## 🏃 はじめに

1. **リポジトリをクローンする:**

   ```bash
   git clone <repository-url>
   cd nexus3d
   ```

2. **環境変数を構成する:**
   ルートディレクトリの `.env.example` の名前を `.env` に変更し、OpenAI APIキーを挿入します。

   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Docker Composeを使用してアプリケーションを起動する:**

   ```bash
   docker-compose up -d --build
   ```

4. **アプリケーションにアクセスする:**
   - **Webクライアント:** http://localhost:3000
   - **APIドキュメント (Swagger):** http://localhost:8000/docs

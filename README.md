<div align="center">

# 🖥️ User Management System — Frontend

**Next.js で構築されたユーザー管理システムの管理画面**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

---

## 🌐 言語 / Language / Ngôn ngữ

- 🇯🇵 [日本語](#-日本語)
- 🇺🇸 [English](#-english)
- 🇻🇳 [Tiếng Việt](#-tiếng-việt)

---

---

# 🇯🇵 日本語

## 📖 目次

- [概要](#概要-1)
- [主な機能](#主な機能-1)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成-1)
- [セットアップ](#セットアップ-1)
- [API通信設計](#api通信設計)
- [環境変数](#環境変数-1)

## 概要

**User Management System Frontend** は、Next.js で構築された管理画面アプリケーションです。

Spring Boot バックエンドと連携し、ユーザー・グループ・権限・プロフィールを管理する UI を提供します。独自の `apiFetch` ラッパーにより、JWT認証・エラーハンドリング・401自動リダイレクトを一元管理しています。

## 主な機能

### 🔑 認証
- JWT ログイン / ログアウト
- `localStorage` によるトークン保持
- 401 発生時に自動でログイン画面へリダイレクト
- 403（権限なし）は呼び出し元で個別ハンドリング

### 👤 ユーザー管理
- ページネーション付きユーザー一覧（`skip` / `take`）
- ユーザー詳細表示
- ユーザー情報更新
- ユーザーのソフト削除

### 👥 グループ管理
- グループ一覧 / 作成 / 更新 / 削除
- グループへのユーザー追加・削除
- グループ権限の取得・更新

### 🛡️ 権限管理
- グループ単位で View / Edit 権限を設定
- 機能一覧（Feature）の取得

### 🪪 プロフィール管理
- プロフィール情報の取得・更新
- パスワード変更
- アバター画像アップロード（`multipart/form-data`）

## 技術スタック

| 技術 | 用途 |
|---|---|
| Next.js 15 | フレームワーク（App Router） |
| TypeScript | 型安全な開発 |
| Tailwind CSS | スタイリング |
| Fetch API | HTTP通信（独自ラッパー） |
| localStorage | JWTトークン保持 |

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router ページ
│   ├── (auth)/             # ログインページ
│   └── (dashboard)/        # 管理画面ページ群
├── components/             # 共通UIコンポーネント
├── lib/
│   └── api.ts              # apiFetch ラッパー・全API定義
├── types/                  # 型定義（ApiResponse, UserResponse など）
└── hooks/                  # カスタムフック
```

## セットアップ

### 前提条件

- Node.js 18+
- npm / yarn / pnpm
- バックエンド（Spring Boot）が起動済みであること

### インストール手順

**1. リポジトリをクローン**
```bash
git clone https://github.com/your-username/user-management-frontend.git
cd user-management-frontend
```

**2. 依存パッケージをインストール**
```bash
npm install
```

**3. 環境変数を設定**
```bash
cp .env.example .env.local
```

`.env.local` を編集:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

**4. 開発サーバーを起動**
```bash
npm run dev
```

アプリは `http://localhost:3000` で起動します。

### ビルド（本番）
```bash
npm run build
npm run start
```

## API通信設計

### apiFetch ラッパー

全APIコールは `src/lib/api.ts` の `apiFetch` を経由します。

```
リクエスト
  └─ Authorization: Bearer <token> を自動付与
  └─ Content-Type: application/json を自動付与

レスポンス
  ├─ 200 OK       → data を返す
  ├─ 401 Unauthorized → localStorage.clear() + ログイン画面へリダイレクト
  │                    ※ /auth/ パスは除外
  ├─ 403 Forbidden    → err.status = 403 でthrow（呼び出し元でハンドリング）
  └─ その他エラー  → Error をthrow
```

### safeCall ヘルパー

権限がない場合にフォールバック値を返すヘルパー関数:

```typescript
// 403 の場合は fallback を返し、それ以外はエラーをthrow
const data = await safeCall(() => userApi.getAll(), []);
```

### APIモジュール一覧

| モジュール | 対応エンドポイント |
|---|---|
| `authApi` | `/api/v1/auth/login`, `/api/v1/auth/register` |
| `userApi` | `/api/v1/users` (GET / PUT / DELETE + pagination) |
| `groupApi` | `/api/v1/groups` + users + permissions |
| `profileApi` | `/api/v1/profile` + password + avatar |
| `featureApi` | `/api/v1/features` |

### ページネーション

```typescript
// skip/take パラメータで制御
const res = await userApi.getAll({ skip: 0, take: 10 });
// res.data = { items: [...], total: 100, skip: 0, take: 10 }
```

### アバターアップロード

アバターのみ `multipart/form-data` で送信（`Content-Type` ヘッダーを付与しない）:

```typescript
await profileApi.uploadAvatar(file); // File オブジェクトを渡す
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | バックエンドのベースURL | `http://localhost:8081` |

---

---

# 🇺🇸 English

## 📖 Table of Contents

- [Overview](#overview-1)
- [Features](#features-1)
- [Tech Stack](#tech-stack-1)
- [Project Structure](#project-structure-1)
- [Getting Started](#getting-started-1)
- [API Design](#api-design)
- [Environment Variables](#environment-variables-1)

## Overview

**User Management System Frontend** is an admin dashboard built with **Next.js**, integrated with a Spring Boot backend.

It provides a UI for managing users, groups, permissions, and profiles. All HTTP communication is handled by a custom `apiFetch` wrapper that centralizes JWT injection, error handling, and automatic 401 redirects.

## Features

### 🔑 Authentication
- JWT login / logout
- Token stored in `localStorage`
- Auto-redirect to login on 401
- 403 (forbidden) thrown for caller to handle individually

### 👤 User Management
- Paginated user list (`skip` / `take`)
- User detail view
- Update user info
- Soft delete user

### 👥 Group Management
- List / Create / Update / Delete groups
- Add / Remove users from groups
- Get and update group permissions

### 🛡️ Permission Management
- Configure View / Edit permissions per group
- Fetch feature list

### 🪪 Profile Management
- Get and update profile
- Change password
- Upload avatar (`multipart/form-data`)

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | Framework (App Router) |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Fetch API | HTTP client (custom wrapper) |
| localStorage | JWT token storage |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login page
│   └── (dashboard)/        # Admin dashboard pages
├── components/             # Shared UI components
├── lib/
│   └── api.ts              # apiFetch wrapper & all API definitions
├── types/                  # Type definitions (ApiResponse, UserResponse, etc.)
└── hooks/                  # Custom React hooks
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Backend (Spring Boot) running

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/user-management-frontend.git
cd user-management-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

**4. Start development server**
```bash
npm run dev
```

App runs at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run start
```

## API Design

### apiFetch Wrapper

All API calls go through `apiFetch` in `src/lib/api.ts`.

```
Request
  └─ Auto-attach Authorization: Bearer <token>
  └─ Auto-attach Content-Type: application/json

Response
  ├─ 200 OK           → return data
  ├─ 401 Unauthorized → localStorage.clear() + redirect to login
  │                     (skipped for /auth/ routes)
  ├─ 403 Forbidden    → throw with err.status = 403 (caller handles)
  └─ Other errors     → throw Error
```

### safeCall Helper

Returns a fallback value when the user lacks permission (403):

```typescript
// Returns fallback on 403, throws on any other error
const data = await safeCall(() => userApi.getAll(), []);
```

### API Modules

| Module | Endpoints |
|---|---|
| `authApi` | `/api/v1/auth/login`, `/api/v1/auth/register` |
| `userApi` | `/api/v1/users` (GET / PUT / DELETE + pagination) |
| `groupApi` | `/api/v1/groups` + users + permissions |
| `profileApi` | `/api/v1/profile` + password + avatar |
| `featureApi` | `/api/v1/features` |

### Pagination

```typescript
const res = await userApi.getAll({ skip: 0, take: 10 });
// res.data = { items: [...], total: 100, skip: 0, take: 10 }
```

### Avatar Upload

Avatar uses `multipart/form-data` — `Content-Type` header is intentionally omitted:

```typescript
await profileApi.uploadAvatar(file); // Pass a File object
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL | `http://localhost:8081` |

---

---

# 🇻🇳 Tiếng Việt

## 📖 Mục lục

- [Giới thiệu](#giới-thiệu-1)
- [Chức năng](#chức-năng-1)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục-1)
- [Cài đặt](#cài-đặt-1)
- [Thiết kế API](#thiết-kế-api)
- [Biến môi trường](#biến-môi-trường-1)

## Giới thiệu

**User Management System Frontend** là trang quản trị được xây dựng bằng **Next.js**, kết nối với backend Spring Boot.

Cung cấp giao diện quản lý người dùng, nhóm, phân quyền và hồ sơ cá nhân. Toàn bộ giao tiếp HTTP được xử lý qua `apiFetch` — một wrapper tập trung việc gắn JWT, xử lý lỗi và tự động redirect khi token hết hạn.

## Chức năng

### 🔑 Xác thực
- Đăng nhập / Đăng xuất bằng JWT
- Token lưu trong `localStorage`
- Tự động redirect về trang login khi gặp 401
- Lỗi 403 (không có quyền) được throw để nơi gọi tự xử lý

### 👤 Quản lý người dùng
- Danh sách người dùng có phân trang (`skip` / `take`)
- Xem chi tiết người dùng
- Cập nhật thông tin người dùng
- Xóa mềm người dùng

### 👥 Quản lý nhóm
- Danh sách / Tạo / Cập nhật / Xóa nhóm
- Thêm / Xóa người dùng khỏi nhóm
- Lấy và cập nhật quyền của nhóm

### 🛡️ Quản lý quyền
- Cấu hình quyền View / Edit theo nhóm
- Lấy danh sách tính năng (Feature)

### 🪪 Hồ sơ cá nhân
- Xem và cập nhật hồ sơ
- Đổi mật khẩu
- Upload ảnh đại diện (`multipart/form-data`)

## Công nghệ

| Công nghệ | Mục đích |
|---|---|
| Next.js 15 | Framework (App Router) |
| TypeScript | Phát triển có kiểu dữ liệu |
| Tailwind CSS | Giao diện |
| Fetch API | Giao tiếp HTTP (custom wrapper) |
| localStorage | Lưu JWT token |

## Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Trang đăng nhập
│   └── (dashboard)/        # Các trang quản trị
├── components/             # Component dùng chung
├── lib/
│   └── api.ts              # apiFetch wrapper & toàn bộ API
├── types/                  # Kiểu dữ liệu (ApiResponse, UserResponse,...)
└── hooks/                  # Custom React hooks
```

## Cài đặt

### Yêu cầu

- Node.js 18+
- npm / yarn / pnpm
- Backend (Spring Boot) đang chạy

### Các bước cài đặt

**1. Clone repository**
```bash
git clone https://github.com/your-username/user-management-frontend.git
cd user-management-frontend
```

**2. Cài đặt dependencies**
```bash
npm install
```

**3. Cấu hình biến môi trường**
```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

**4. Chạy development server**
```bash
npm run dev
```

App chạy tại `http://localhost:3000`.

### Build production
```bash
npm run build
npm run start
```

## Thiết kế API

### apiFetch Wrapper

Toàn bộ API call đi qua `apiFetch` trong `src/lib/api.ts`.

```
Request
  └─ Tự động gắn Authorization: Bearer <token>
  └─ Tự động gắn Content-Type: application/json

Response
  ├─ 200 OK           → trả về data
  ├─ 401 Unauthorized → localStorage.clear() + redirect về login
  │                     (bỏ qua nếu path chứa /auth/)
  ├─ 403 Forbidden    → throw với err.status = 403 (nơi gọi tự xử lý)
  └─ Lỗi khác         → throw Error
```

### safeCall Helper

Trả về giá trị fallback khi không có quyền (403):

```typescript
// Trả về fallback nếu 403, throw nếu lỗi khác
const data = await safeCall(() => userApi.getAll(), []);
```

### Các module API

| Module | Endpoint |
|---|---|
| `authApi` | `/api/v1/auth/login`, `/api/v1/auth/register` |
| `userApi` | `/api/v1/users` (GET / PUT / DELETE + phân trang) |
| `groupApi` | `/api/v1/groups` + users + permissions |
| `profileApi` | `/api/v1/profile` + password + avatar |
| `featureApi` | `/api/v1/features` |

### Phân trang

```typescript
const res = await userApi.getAll({ skip: 0, take: 10 });
// res.data = { items: [...], total: 100, skip: 0, take: 10 }
```

### Upload avatar

Avatar dùng `multipart/form-data` — **không** gắn `Content-Type` thủ công để browser tự xử lý boundary:

```typescript
await profileApi.uploadAvatar(file); // Truyền vào File object
```

## Biến môi trường

| Biến | Mô tả | Mặc định |
|------|-------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | URL gốc của backend | `http://localhost:8081` |

---

## 👨‍💻 Author

<div align="center">

**Trương Quang Quốc**

*Intern Backend Developer*

**IVS Co., Ltd.**

</div>

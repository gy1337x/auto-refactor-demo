# Auto Refactor Demo

OpenClaw `auto-refactor` skill 的演示项目。展示如何用 AI agent 自动化地将一个臃肿的代码库逐步重构为清晰的模块化结构。

## 项目背景

这是一个简单的 Task Manager API，最初所有逻辑都塞在一个 `user.ts` 文件里（170 行），存在以下问题：

- 认证、用户资料、管理功能全部混在一起
- 硬编码的配置值（密钥、数据库地址）
- 使用 MD5 哈希密码（不安全）
- 存在空指针崩溃 bug
- 大量 `console.log` 调试语句和死代码
- 路由层缺少 token 验证

## 重构过程

通过 `auto-refactor` skill 分 5 个阶段自动完成：

| Phase | 内容 | 涉及文件 |
|-------|------|----------|
| 1 | 提取硬编码配置到 `config.ts`，支持环境变量 | `config.ts`, `user.ts`, `index.ts` |
| 2 | 拆分 `user.ts` 为 `auth.ts` + `profile.ts` + `admin.ts` + `store.ts` | 6 个文件 |
| 3 | 修复 `assignTask` 空指针崩溃 + profile 路由 token 验证 | `task.ts`, `index.ts` |
| 4 | 清理死代码（`validateEmail`, `hashPassword`, `SessionInfo`）和调试日志 | 自动完成 |
| 5 | 密码哈希升级 MD5 → SHA-256（带盐） | `auth.ts` |

## 重构后结构

```
src/
├── config.ts    # 环境变量配置
├── store.ts     # 共享数据存储 + User 类型
├── auth.ts      # 注册 / 登录 / Token 生成与验证
├── profile.ts   # 用户资料管理
├── admin.ts     # 管理员功能
├── task.ts      # 任务 CRUD + 权限控制
└── index.ts     # HTTP 路由入口
```

## 额外改进

在初始重构基础上，项目还进一步增强了：

- **密码安全**: 从简单 SHA-256 升级为 PBKDF2 (100k iterations) + 随机盐
- **Token 安全**: 添加 HMAC-SHA256 签名 + 常量时间比较（防时序攻击）
- **输入验证**: 注册时校验邮箱格式、密码长度、姓名非空
- **权限控制**: 任务的查看/更新/删除需要认证，且只有 assignee 或 admin 可操作
- **状态校验**: 任务状态只能是 `todo` / `in_progress` / `done`

## 快速开始

```bash
# 安装依赖
npm install

# 编译
npx tsc

# 启动服务
npm start
```

服务运行在 `http://localhost:3000`

## API 接口

### 认证

```bash
# 注册
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@example.com","password":"123456"}'

# 登录
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### 用户资料

```bash
# 查看资料（需要 token）
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>"

# 更新资料
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"new name"}'
```

### 任务管理

```bash
# 创建任务
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix bug","description":"Fix the login issue"}'

# 获取任务列表
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>"

# 更新任务状态
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# 删除任务
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `JWT_SECRET` | `super-secret-key-12345` | Token 签名密钥 |
| `TOKEN_EXPIRY` | `3600` | Token 过期时间（秒） |
| `DB_HOST` | `localhost` | 数据库地址 |
| `DB_PORT` | `5432` | 数据库端口 |
| `PORT` | `3000` | 服务端口 |

## Git 历史

```
3507904 fix phase 5: upgrade password hash from MD5 to SHA-256
8ca7ca3 fix phase 3: assignTask null crash + profile route token verification
3587e66 refactor phase 2: split user.ts into auth/profile/admin modules
a641f6f refactor phase 1: extract hardcoded config to config.ts
17b12e4 fix: remove node_modules from tracking
8be3402 initial: task-manager API with known issues
```

每个阶段都有独立 commit，方便回滚和 code review。

## License

MIT

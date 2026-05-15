generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   @default("USER") // USER or ADMIN
  status    String   @default("PENDING") // PENDING, APPROVED, REJECTED
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  responses Response[]
}

model Question {
  id        String   @id @default(cuid())
  chapter   String
  text      String
  optionA   String
  optionB   String
  optionC   String
  optionD   String
  optionE   String
  correct   String   // A, B, C, D, or E
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  responses Response[]
}

model Response {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  userAnswer String
  isCorrect  Boolean
  status     String   @default("Checked") // Checked, Recheck
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])

  @@unique([userId, questionId])
}

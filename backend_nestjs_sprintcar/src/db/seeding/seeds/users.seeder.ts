import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserEntity } from '../../../users/user.entity';

type SeedUserInput = {
  roleId: number;
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
  phone?: string | null;
  birthDate?: string;
  gender?: string | null;
  documentId?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive?: boolean;
};

async function readUsersFromJson(): Promise<SeedUserInput[]> {
  const filePath = path.resolve(__dirname, '..', 'data', 'users.json');
  const content = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(content) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('users.json must contain an array of users');
  }

  return parsed as SeedUserInput[];
}

export class UsersSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(UserEntity);
    const users = await readUsersFromJson();

    for (const user of users) {
      const existingUser = await userRepository.findOne({ where: { email: user.email } });

      if (existingUser) {
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, 10);

      const createdUser = userRepository.create({
        roleId: user.roleId,
        name: user.name ?? null,
        lastName: user.lastName ?? null,
        email: user.email,
        passwordHash,
        avatarUrl: user.avatarUrl ?? null,
        phone: user.phone ?? null,
        birthDate: user.birthDate ? new Date(user.birthDate) : null,
        gender: user.gender ?? null,
        documentId: user.documentId ?? null,
        address: user.address ?? null,
        city: user.city ?? null,
        postalCode: user.postalCode ?? null,
        country: user.country ?? null,
        isActive: user.isActive ?? true,
      });

      await userRepository.save(createdUser);
    }

    console.log('Seeding de users completado');
  }
}

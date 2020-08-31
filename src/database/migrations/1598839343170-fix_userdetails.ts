import {MigrationInterface, QueryRunner} from "typeorm";

export class fixUserdetails1598839343170 implements MigrationInterface {
    name = 'fixUserdetails1598839343170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_details` DROP COLUMN `status`");
        await queryRunner.query("ALTER TABLE `user_details` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `user_details` DROP COLUMN `updated_at`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_details` ADD `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `user_details` ADD `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `user_details` ADD `status` varchar(8) NOT NULL DEFAULT 'ACTIVE'");
    }

}

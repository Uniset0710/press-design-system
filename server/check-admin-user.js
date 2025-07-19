const { AppDataSource } = require('./src/database');
const { User } = require('./src/entities/User');
const bcrypt = require('bcrypt');

async function checkAdminUser() {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);
    
    console.log('=== Admin 사용자 확인 ===');
    
    // admin 사용자 조회
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } });
    
    if (adminUser) {
      console.log('Admin 사용자 발견:');
      console.log('- ID:', adminUser.id);
      console.log('- Username:', adminUser.username);
      console.log('- Email:', adminUser.email);
      console.log('- Role:', adminUser.role);
      console.log('- Password hash:', adminUser.password.substring(0, 20) + '...');
      
      // 비밀번호 테스트
      const testPassword = 'admin';
      const isValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log('- 비밀번호 "admin" 검증:', isValid);
    } else {
      console.log('Admin 사용자가 존재하지 않습니다.');
    }
    
    // 모든 사용자 목록
    const allUsers = await userRepo.find();
    console.log('\n=== 모든 사용자 목록 ===');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('오류:', error);
  }
}

checkAdminUser(); 
export const routeByRole = (role: string) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'teacher': return '/teacher/dashboard';
    case 'student': return '/student/dashboard';
    default: return '/';
  }
}

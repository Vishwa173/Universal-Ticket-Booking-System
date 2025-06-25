import ProfileForm from '../components/ProfileForm';

export default function Profile({ user }) {
  return (
    <div>
      <ProfileForm user={user} />
    </div>
  );
}

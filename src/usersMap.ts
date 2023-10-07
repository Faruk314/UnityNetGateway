let users = new Map();

const addUser = (userId: number, socketId: string) => {
  if (!users.has(userId)) {
    users.set(userId, socketId);
  }
};

const removeUser = (socketId: string) => {
  const userEntries = [...users.entries()];

  const usersEntriesFilterd = userEntries.filter(
    ([_, value]) => value !== socketId
  );

  users = new Map(usersEntriesFilterd);
};

const getUser = (userId: number) => {
  return users.get(userId);
};

export { users, addUser, removeUser, getUser };

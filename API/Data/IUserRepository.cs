using API.Entity;

namespace API.Data;

public interface IUserRepository
{
    User CreateUser(User user);

    User GetByName(string name);
    User GetById(int id);
}
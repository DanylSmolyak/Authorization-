using API.Entity;

namespace API.Data;

public class Repository : IUserRepository
{

    private readonly UserContext _context;
    
    public Repository(UserContext context)
    {
        _context = context;
    }
    
    public User CreateUser(User user)
    {
        _context.Users.Add(user);
        user.Id = _context.SaveChanges();

        return user;
    }

    public User GetByName(string name)
    {
        return _context.Users.FirstOrDefault(u => u.Name == name);
    }

    public User GetById(int id)
    {
        return _context.Users.FirstOrDefault(u => u.Id == id);
    }
}
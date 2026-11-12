using System;
using System.Collections.Generic;
using System.Linq;
using API.Models;
using API.Persistence;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class NotesRepository
{
	private readonly ApplicationDbContext _dbContext;

	public NotesRepository(ApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public Note Create(Note obj)
	{
		_dbContext.Notes.Add(obj);
		_dbContext.SaveChanges();
		return obj;
	}

	public void Delete(Guid id)
	{
		Note obj = _dbContext.Notes.Single(obj => obj.Id == id);
		_dbContext.Notes.Remove(obj);
		_dbContext.SaveChanges();
	}

	public bool Exists(Guid id)
	{
		return _dbContext.Notes
							.AsNoTracking()
							.Any(obj => obj.Id == id);
	}

	public IEnumerable<Note> GetAll()
	{
		return _dbContext.Notes
							.AsNoTracking()
							.ToList();
	}

	public Note GetById(Guid id)
	{
		return _dbContext.Notes
							.AsNoTracking()
							.Single(obj => obj.Id == id);
	}

	public void Update(Guid id, Note obj)
	{
		Note existing = _dbContext.Notes.Single(n => n.Id == id);

		existing.Title = obj.Title;
		existing.Body = obj.Body;

		_dbContext.SaveChanges();
	}
}

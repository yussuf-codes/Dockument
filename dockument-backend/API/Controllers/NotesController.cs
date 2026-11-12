using System;
using System.Collections.Generic;
using System.Linq;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Mappings;
using API.Models;
using API.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
public class NotesController : ControllerBase
{
	private readonly NotesRepository _repository;

	public NotesController(NotesRepository repository)
	{
		_repository = repository;
	}

	[HttpDelete(Endpoints.Notes.Delete)]
	public IActionResult Delete(Guid id)
	{
		if (_repository.Exists(id))
		{
			_repository.Delete(id);
			return NoContent();
		}
		else
			return NotFound();
	}

	[HttpGet(Endpoints.Notes.Get)]
	public IActionResult Get()
	{
		IEnumerable<Note> notes = _repository.GetAll();
		List<NoteResponse> response = new();
		foreach (var note in notes)
			response.Add(NoteMappings.MapToResponse(note));
		return Ok(response);
	}

	[HttpGet(Endpoints.Notes.GetById)]
	public IActionResult Get(Guid id)
	{
		if (_repository.Exists(id))
			return Ok(NoteMappings.MapToResponse(_repository.GetById(id)));
		else
			return NotFound();
	}

	[HttpPost(Endpoints.Notes.Create)]
	public IActionResult Post(NoteRequest request)
	{
		Note response = _repository.Create(NoteMappings.MapToNote(request));
		return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
	}

	[HttpPut(Endpoints.Notes.Update)]
	public IActionResult Put(Guid id, NoteRequest request)
	{
		if (_repository.Exists(id))
		{
			_repository.Update(id, NoteMappings.MapToNote(request));
			return NoContent();
		}
		else
			return NotFound();
	}
}

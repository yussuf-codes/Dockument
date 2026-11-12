using System;

namespace API.DTOs.Responses;

public class NoteResponse
{
	public required Guid Id { get; init; }
	public required string Title { get; init; }
	public required string Body { get; init; }
}

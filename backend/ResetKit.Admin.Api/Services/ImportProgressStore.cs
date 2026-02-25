using System.Collections.Concurrent;
using ResetKit.Admin.Api.Dtos;

namespace ResetKit.Admin.Api.Services;

public interface IImportProgressStore
{
    void Start(Guid id, int totalRows);
    void Increment(Guid id, bool isError);
    void Complete(Guid id, int importedCount, int errorCount);
    ImportOrdersProgressResponse? Get(Guid id);
}

internal class InMemoryImportProgressStore : IImportProgressStore
{
    private readonly ConcurrentDictionary<Guid, ImportOrdersProgressResponse> _store = new();

    public void Start(Guid id, int totalRows)
    {
        var progress = new ImportOrdersProgressResponse
        {
            ProgressId = id,
            TotalRows = totalRows,
            ProcessedRows = 0,
            ImportedCount = 0,
            ErrorCount = 0,
            Completed = false
        };

        _store[id] = progress;
    }

    public void Increment(Guid id, bool isError)
    {
        _store.AddOrUpdate(
            id,
            _ => new ImportOrdersProgressResponse
            {
                ProgressId = id,
                TotalRows = 0,
                ProcessedRows = 1,
                ImportedCount = isError ? 0 : 1,
                ErrorCount = isError ? 1 : 0,
                Completed = false
            },
            (_, existing) =>
            {
                existing.ProcessedRows++;
                if (isError)
                {
                    existing.ErrorCount++;
                }
                else
                {
                    existing.ImportedCount++;
                }

                return existing;
            });
    }

    public void Complete(Guid id, int importedCount, int errorCount)
    {
        if (_store.TryGetValue(id, out var existing))
        {
            existing.Completed = true;
            existing.ImportedCount = importedCount;
            existing.ErrorCount = errorCount;
        }
    }

    public ImportOrdersProgressResponse? Get(Guid id)
    {
        return _store.TryGetValue(id, out var progress) ? progress : null;
    }
}


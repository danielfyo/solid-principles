namespace SolidPrinciples.Isp.Good;

// ✅ Small "role interfaces", each shaped by what one kind of client needs.

public interface IOrderReader
{
    StoredOrder? GetById(string id);
}

public interface IOrderWriter
{
    void Save(StoredOrder order);

    void Delete(string id);
}

public interface ISalesStatistics
{
    decimal TotalSalesFor(int year, int month);
}
